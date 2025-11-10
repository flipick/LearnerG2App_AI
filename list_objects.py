from google.cloud import storage

def list_bucket_objects():
    try:
        # Initialize client
        storage_client = storage.Client()
        
        # Get the bucket
        bucket_name = 'ai-agent-2-rag-docs-449007'
        bucket = storage_client.bucket(bucket_name)
        
        # List objects
        blobs = list(bucket.list_blobs())
        
        print(f"Found {len(blobs)} objects in bucket:")
        for blob in blobs:
            print(f" - {blob.name} ({blob.size} bytes)")
        
        return True
    except Exception as e:
        print(f"Error listing objects: {str(e)}")
        return False

if __name__ == "__main__":
    list_bucket_objects()
