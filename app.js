const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = 'YOUR_PROJECT_ID_HERE';
const APPWRITE_DATABASE_ID = 'qwcrow_db';
const APPWRITE_COLLECTION_ID = 'counters';
const APPWRITE_DOCUMENT_ID = 'global_click_count';

const client = new Appwrite.Client();
client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);

const database = new Appwrite.Databases(client);

let currentCount = 0;
let isLoading = false;

const countDisplay = document.getElementById('countDisplay');
const clickBtn = document.getElementById('clickBtn');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('statusText');

async function loadCount() {
    if (isLoading) return;
    isLoading = true;
    statusText.innerHTML = '<span class="loading"></span> Loading...';
    
    try {
        const document = await database.getDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            APPWRITE_DOCUMENT_ID
        );
        currentCount = document.count || 0;
        countDisplay.innerText = currentCount;
        statusText.innerHTML = 'Ready';
    } catch (error) {
        if (error.code === 404) {
            try {
                await database.createDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_ID,
                    APPWRITE_DOCUMENT_ID,
                    { count: 0 }
                );
                currentCount = 0;
                countDisplay.innerText = currentCount;
                statusText.innerHTML = 'Ready';
            } catch (createError) {
                statusText.innerHTML = 'Failed to create counter. Check Appwrite setup.';
                console.error(createError);
            }
        } else {
            statusText.innerHTML = 'Failed to load count';
            console.error(error);
        }
    }
    
    isLoading = false;
}

async function incrementCount() {
    if (isLoading) return;
    isLoading = true;
    statusText.innerHTML = '<span class="loading"></span> Updating...';
    
    try {
        const document = await database.getDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            APPWRITE_DOCUMENT_ID
        );
        
        const newCount = (document.count || 0) + 1;
        
        await database.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            APPWRITE_DOCUMENT_ID,
            { count: newCount }
        );
        
        currentCount = newCount;
        countDisplay.innerText = currentCount;
        statusText.innerHTML = 'Counted!';
        
        setTimeout(() => {
            if (statusText.innerHTML === 'Counted!') {
                statusText.innerHTML = 'Ready';
            }
        }, 1500);
    } catch (error) {
        statusText.innerHTML = 'Failed to increment';
        console.error(error);
    }
    
    isLoading = false;
}

async function resetCount() {
    if (isLoading) return;
    if (!confirm('Reset the global counter to zero? This cannot be undone.')) return;
    
    isLoading = true;
    statusText.innerHTML = '<span class="loading"></span> Resetting...';
    
    try {
        await database.updateDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_COLLECTION_ID,
            APPWRITE_DOCUMENT_ID,
            { count: 0 }
        );
        
        currentCount = 0;
        countDisplay.innerText = currentCount;
        statusText.innerHTML = 'Reset to zero';
        
        setTimeout(() => {
            if (statusText.innerHTML === 'Reset to zero') {
                statusText.innerHTML = 'Ready';
            }
        }, 1500);
    } catch (error) {
        statusText.innerHTML = 'Failed to reset';
        console.error(error);
    }
    
    isLoading = false;
}

clickBtn.onclick = incrementCount;
resetBtn.onclick = resetCount;

loadCount();
