from google.cloud import storage

def upload_test_file():
    try:
        # Initialize client
        storage_client = storage.Client()
        
        # Get the bucket
        bucket_name = 'ai-agent-2-rag-docs-449007'
        bucket = storage_client.bucket(bucket_name)
        
        # Upload a file
        blob = bucket.blob('test_documents/test_doc.txt')
        blob.upload_from_filename('test_doc.txt')
        
        print(f"Successfully uploaded test_doc.txt to {bucket_name}/test_documents/")
        return True
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return False

if __name__ == "__main__":
    upload_test_file()
