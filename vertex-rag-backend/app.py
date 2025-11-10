import os
import logging
from flask import Flask, jsonify, request
from flask_cors import CORS
import traceback
import uuid
from datetime import datetime
from google.cloud import storage

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# GCS Configuration
BUCKET_NAME = 'ai-agent-2-rag-docs-449007'

# GCS Manager Class
class GCSManager:
    def __init__(self, bucket_name):
        self.storage_client = storage.Client()
        self.bucket_name = bucket_name
        self.bucket = self.storage_client.bucket(bucket_name)
    
    def upload_file(self, file_obj, prefix="documents"):
        """Upload a file to GCS bucket with a unique name."""
        # Generate unique filename to avoid collisions
        original_filename = file_obj.filename
        file_extension = os.path.splitext(original_filename)[1]
        unique_filename = f"{prefix}/{uuid.uuid4()}{file_extension}"
        
        # Create a blob and upload the file
        blob = self.bucket.blob(unique_filename)
        blob.upload_from_file(file_obj, content_type=file_obj.content_type)
        
        # Store metadata
        metadata = {
            'original_filename': original_filename,
            'content_type': file_obj.content_type,
            'uploaded_at': datetime.now().isoformat()
        }
        
        blob.metadata = metadata
        blob.patch()
        
        # Return the GCS URI and the blob name
        gcs_uri = f"gs://{self.bucket_name}/{unique_filename}"
        
        return {
            'gcs_uri': gcs_uri,
            'blob_name': unique_filename,
            'original_filename': original_filename
        }
    
    def list_files(self, prefix="documents"):
        """List all files in the bucket with the given prefix."""
        blobs = self.storage_client.list_blobs(
            self.bucket_name, prefix=prefix
        )
        
        files = []
        for blob in blobs:
            # Skip directory placeholders
            if blob.name.endswith('/'):
                continue
            
            try:
                # Try to get metadata
                metadata = blob.metadata or {}
                original_filename = metadata.get('original_filename', 
                                               os.path.basename(blob.name))
            except Exception as e:
                original_filename = os.path.basename(blob.name)
            
            files.append({
                'blob_name': blob.name,
                'original_filename': original_filename,
                'content_type': blob.content_type,
                'size': blob.size,
                'updated': blob.updated.isoformat() if blob.updated else None,
                'gcs_uri': f"gs://{self.bucket_name}/{blob.name}"
            })
        
        return files
    
    def delete_file(self, blob_name):
        """Delete a file from the bucket."""
        blob = self.bucket.blob(blob_name)
        blob.delete()
        return True

# Initialize GCS Manager
gcs_manager = GCSManager(BUCKET_NAME)

# In-memory storage for document metadata
documents = []

@app.route('/')
def home():
    return jsonify({"status": "Server is running", "message": "Welcome to RAG API - MODIFIED VERSION"})

@app.route('/test-documents')
def test_documents():
    """Test endpoint for listing documents"""
    return jsonify({"status": "success", "message": "Documents test endpoint works"})

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    try:
        # Upload to GCS
        upload_info = gcs_manager.upload_file(file)
        
        # Store document info
        doc_id = str(uuid.uuid4())
        document = {
            "id": doc_id,
            "filename": file.filename,
            "content_type": file.content_type,
            "uploaded_at": datetime.now().isoformat(),
            "gcs_uri": upload_info['gcs_uri'],
            "blob_name": upload_info['blob_name']
        }
        documents.append(document)
        
        logger.info(f"Added document {file.filename} with ID {doc_id}")
        
        return jsonify({
            'success': True, 
            'message': f"Document {file.filename} processed and ready for queries",
            'document_id': doc_id
        }), 200
    
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/documents', methods=['GET'])
def list_documents():
    try:
        # Get files from GCS
        gcs_files = gcs_manager.list_files()
        
        return jsonify({
            'success': True,
            'documents': documents,
            'gcs_files': gcs_files
        }), 200
    
    except Exception as e:
        logger.error(f"Error listing documents: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/documents/<doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    try:
        # Find document
        doc = next((d for d in documents if d['id'] == doc_id), None)
        if not doc:
            return jsonify({'error': 'Document not found'}), 404
        
        # Delete from GCS
        gcs_manager.delete_file(doc['blob_name'])
        
        # Remove from memory
        documents[:] = [d for d in documents if d['id'] != doc_id]
        
        return jsonify({
            'success': True,
            'message': f"Document {doc['filename']} deleted"
        }), 200
    
    except Exception as e:
        logger.error(f"Error deleting document: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    
    if not data or 'query' not in data:
        return jsonify({'error': 'No query provided'}), 400
    
    query_text = data['query']
    logger.info(f"Received query: {query_text}")
    
    # Mock response - in reality, this would use Vertex AI
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
        logger.info(f"Starting Flask application on port 3000...")
        app.run(host='0.0.0.0', port=3000, debug=True)
    except Exception as e:
        logger.error(f"Failed to start Flask application: {str(e)}")
        logger.error(traceback.format_exc())
