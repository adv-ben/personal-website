from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import os

class ChatHandler(BaseHTTPRequestHandler):
    model = None
    tokenizer = None
    
    @classmethod
    def load_model(cls):
        if cls.model is None:
            print("Loading model...")
            
            # Ultra-lightweight models in order of preference
            tiny_models = [
                "microsoft/DialoGPT-small",      # ~117MB
                "distilgpt2",                    # ~353MB
                "gpt2",                          # ~548MB
                "sshleifer/tiny-gpt2",           # ~40MB (very basic)
                "uer/gpt2-chinese-cluecorpussmall", # Small alternative
            ]
            
            for model_name in tiny_models:
                try:
                    print(f"Trying model: {model_name}")
                    
                    cls.tokenizer = AutoTokenizer.from_pretrained(
                        model_name,
                        trust_remote_code=True
                    )
                    
                    cls.model = AutoModelForCausalLM.from_pretrained(
                        model_name,
                        torch_dtype=torch.float32,  # Use float32 for better compatibility
                        trust_remote_code=True,
                        low_cpu_mem_usage=True
                    )
                    
                    # Set padding token
                    if cls.tokenizer.pad_token is None:
                        cls.tokenizer.pad_token = cls.tokenizer.eos_token
                    
                    print(f"Successfully loaded: {model_name}")
                    return True
                    
                except Exception as e:
                    print(f"Failed to load {model_name}: {e}")
                    continue
            
            print("Failed to load any model!")
            return False
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        if self.path != '/api/chat':
            self.send_json_response({"error": "Not found"}, 404)
            return
            
        try:
            # Read request
            length = int(self.headers['Content-Length'])
            data = json.loads(self.rfile.read(length).decode())
            message = data.get('message', '').strip()
            
            if not message:
                self.send_json_response({"error": "Message required"}, 400)
                return
                
            if self.model is None:
                self.send_json_response({"error": "Model not loaded. Please restart the server."}, 503)
                return
            
            # Generate response
            response = self.chat(message)
            self.send_json_response({"response": response})
            
        except Exception as e:
            print(f"Error: {e}")
            self.send_json_response({"error": "Server error"}, 500)
    
    def chat(self, message):
        try:
            # Simple prompt format for small models
            prompt = message
            
            # Tokenize with shorter limits for faster processing
            inputs = self.tokenizer.encode(
                prompt, 
                return_tensors="pt", 
                max_length=200,  # Reduced from 400
                truncation=True
            )
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs,
                    max_new_tokens=50,      # Reduced from 100 for faster response
                    temperature=0.8,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id,
                    eos_token_id=self.tokenizer.eos_token_id,
                    attention_mask=torch.ones_like(inputs),
                    repetition_penalty=1.1,  # Reduce repetition
                    top_p=0.9               # Add nucleus sampling
                )
            
            response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Clean up response
            if prompt in response:
                clean_response = response[len(prompt):].strip()
            else:
                clean_response = response.strip()
                
            # Remove prompt echo if it appears
            if clean_response.startswith(message):
                clean_response = clean_response[len(message):].strip()
            
            return clean_response or "I'm here to help! What would you like to know?"
            
        except Exception as e:
            print(f"Chat error: {e}")
            return "I'm having trouble processing that. Could you try rephrasing?"
    
    def send_json_response(self, data, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        print(f"{format % args}")

def main():
    print("Starting lightweight chat server...")
    print("This will use very small models for fast loading and low memory usage.")
    
    if not ChatHandler.load_model():
        print("Failed to load any model. Please check your internet connection and try again.")
        return
    
    server = HTTPServer(('', 3001), ChatHandler)
    print("Server running on port 3001")
    print("Note: Responses may be basic due to using lightweight models.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()

if __name__ == '__main__':
    main()