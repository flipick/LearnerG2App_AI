# First, make sure you're in the correct directory
cd ~/vertex-rag-backend

# Create a new app.py file with the correct content
cat > app.py << 'EOL'
import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import traceback
import uuid

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory storage for our demo
documents = []
vector_store = {}

# Simplified routes
@app.route('/')
def home():
    logger.debug("Home route accessed")
    return jsonify({"status": "Server is running", "message": "Welcome to RAG API (Mock Version)"})

@app.route('/test')
def test():
    logger.debug("Test route accessed")
    return jsonify({"status": "success", "message": "Test endpoint is working"})

# Simplified upload endpoint
@app.route('/upload', methods=['POST'])
def upload_file():
    logger.debug("Upload endpoint accessed")
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Store file info in memory (not actually processing the file)
    file_id = str(uuid.uuid4())
    documents.append({
        "id": file_id,
        "filename": file.filename,
        "content_type": file.content_type,
        "uploaded_at": "2025-11-08T00:00:00Z"
    })
    
    logger.debug(f"Added document {file.filename} with ID {file_id}")
    
    return jsonify({
        'success': True, 
        'message': f"Document {file.filename} processed and ready for queries"
    }), 200

# Simplified query endpoint
@app.route('/query', methods=['POST'])
def query():
    logger.debug("Query endpoint accessed")
    data = request.json
    
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query_text = data['query']
    logger.debug(f"Received query: {query_text}")
    
    # Mock response - in reality, this would use an LLM
    if len(documents) == 0:
        answer = "I don't have any documents to reference. Please upload a document first."
    else:
        document_names = ", ".join([doc["filename"] for doc in documents])
        answer = f"Based on the documents you've uploaded ({document_names}), I can provide the following information about '{query_text}': This is a simulated response that would normally come from an AI model processing your query against the documents you've provided."
    
    return jsonify({
        'answer': answer,
        'success': True
    }), 200

if __name__ == '__main__':
    try:
        logger.info("Starting Flask application on port 3000...")
        app.run(host='0.0.0.0', port=3000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start Flask application: {str(e)}")
        logger.error(traceback.format_exc())
EOL