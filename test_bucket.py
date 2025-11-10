from google.cloud import storage

def test_bucket_access():
    try:
        # Initialize client
        storage_client = storage.Client()
        
        # Get the bucket
        bucket_name = 'ai-agent-2-rag-docs-449007'
        bucket = storage_client.bucket(bucket_name)
        
        # Check if the bucket exists
        if bucket.exists():
            print(f"Successfully connected to bucket: {bucket_name}")
            
            # Try to list objects in the bucket
            blobs = list(bucket.list_blobs())
            print(f"Found {len(blobs)} objects in bucket")
            
            return True
        else:
            print(f"Bucket {bucket_name} doesn't exist")
            return False
    except Exception as e:
        print(f"Error accessing bucket: {str(e)}")
        return False

if __name__ == "__main__":
    test_bucket_access()
