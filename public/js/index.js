let dropZone = document.querySelector('.drop-zone');
let fileInput = document.querySelector('.file');
let fileBtn = document.querySelector('.fileBtn');
let bgProgress = document.querySelector('.bg-progress-bar');
let percentV = document.querySelector('.percent');
let progressBar = document.querySelector('.progress-bar');
let bgProgressContainer = document.querySelector('.bg-progress-container');
let fileURL = document.querySelector('.fileURL');
let sharingContainer = document.querySelector('.sharing-container');
let copyBtn = document.querySelector('.copyBtn');
let emailForm = document.querySelector('.emailForm');
let toast = document.querySelector('.toast');
let fileUploadedMsg = document.querySelector('.file-uploaded-message');
let generatingLinkMsg = document.querySelector('.generating-link-message');
let selectedFileInfo = document.querySelector('.selected-file-info');
let fileDetails = document.querySelector('.file-details');
let cancelUploadBtn = document.querySelector('.cancel-upload-btn');
let currentXhr = null;
let fileChip = document.querySelector('.file-chip');
let fileChipName = document.querySelector('.file-chip-name');
let fileChipSize = document.querySelector('.file-chip-size');

//https://sendeasy.onrender.com/
let host = '/';
let uploadURL = `${host}api/files`;
let emailURL = `${host}api/files/send`

//console.log("hello");

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    if(!dropZone.classList.contains('dragged')){
        dropZone.classList.add('dragged');
    }
});

dropZone.addEventListener('dragleave', (e) => {
    if(dropZone.classList.contains('dragged')){
        dropZone.classList.remove('dragged');
    }
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragged');
    const files = e.dataTransfer.files;
    //console.table(files);
    if(files.length){
        fileInput.files = files;
        uploadFile();
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        const file = fileInput.files[0];
        fileChipName.textContent = file.name;
        fileChipSize.textContent = `(${(file.size / (1024 * 1024)).toFixed(2)} MB)`;
    }
    // Don't show chip yet, only show during upload
    uploadFile();
});

fileBtn.addEventListener('click', () => {
    fileInput.click();
});

copyBtn.addEventListener('click', () => {
    fileURL.select();
    document.execCommand('copy');
    showToast("Link Copied");
});

cancelUploadBtn.addEventListener('click', () => {
    if (currentXhr) {
        currentXhr.abort();
    }
    fileInput.value = '';
    fileChip.style.display = 'none';
    bgProgressContainer.style.display = 'none';
    fileUploadedMsg.style.display = 'none';
    generatingLinkMsg.style.display = 'none';
    sharingContainer.style.display = 'none';
    showToast('Upload canceled');
});

const uploadFile = () => {
    if (!fileInput.files.length) {
        showToast("Please select a file");
        fileChip.style.display = 'none';
        return;
    }

    const file = fileInput.files[0];
    if (file.size > 30 * 1024 * 1024) { // 30MB in bytes
        showToast("File size exceeds 30MB limit!");
        fileInput.value = ""; 
        fileChip.style.display = 'none';
        return;
    }

    // Show file chip and cancel button during upload
    fileChip.style.display = 'flex';
    cancelUploadBtn.style.display = 'inline-block';

    // Show progress container with initial state
    bgProgressContainer.style.display = 'block';
    bgProgressContainer.style.opacity = '1';
    sharingContainer.style.display = 'none';
    fileUploadedMsg.style.display = 'none';
    generatingLinkMsg.style.display = 'none';
    
    // Reset progress indicators
    percentV.innerText = '0';
    bgProgress.style.width = '0%';
    progressBar.style.width = '0%';
    bgProgress.style.transition = 'none';
    progressBar.style.transition = 'none';

    const formData = new FormData();
    const xhr = new XMLHttpRequest();
    currentXhr = xhr;

    formData.append("myfile", file);

    console.log("FormData Contents:");
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);  // Should log: "myfile", File object
    }

    console.log("Uploading File:", file);
    
    xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
            let percent = (e.loaded / e.total) * 100;
            bgProgress.style.width = `${percent}%`;
            percentV.innerText = percent.toFixed(2);
            progressBar.style.width = `${percent}%`;
            if (percent >= 100) {
                bgProgressContainer.style.display = 'none';
                fileUploadedMsg.style.display = 'block';
                setTimeout(() => {
                    fileUploadedMsg.style.display = 'none';
                    generatingLinkMsg.style.display = 'block';
                }, 700);
            }
        }
    };

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            generatingLinkMsg.style.display = 'none';
            // Hide cancel button, but keep chip visible
            cancelUploadBtn.style.display = 'none';
            try {
                const response = JSON.parse(xhr.responseText);
                if (xhr.status === 200) {
                    console.log("✅ File uploaded successfully:", response);
                    sharingContainer.style.display = 'block';
                    if (response.file) {
                        showLink(response.file);
                    }
                }
            } catch (e) {
                // Error handling remains the same
            }
        }
    };

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log("✅ File uploaded successfully:", xhr.responseText);
        } else {
            console.error("❌ File upload failed:", xhr.status, xhr.responseText);
            showToast(`Error: ${xhr.responseText}`);
        }
    };

    xhr.onerror = function () {
        showToast("Error while Uploading");
        generatingLinkMsg.style.display = 'none';
        fileChip.style.display = 'none';
    };

    xhr.onabort = function () {
        showToast('Upload canceled');
        fileChip.style.display = 'none';
        bgProgressContainer.style.display = 'none';
        fileUploadedMsg.style.display = 'none';
        generatingLinkMsg.style.display = 'none';
        sharingContainer.style.display = 'none';
    };

    xhr.open('POST', uploadURL, true);
    xhr.send(formData);
};

const showLink = (url) => {
    fileURL.value = url;
    console.log(url);
};

emailForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    const url = fileURL.value;

    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value
    }

    fetch(emailURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
    }).then((res) => res.json())
    .then((data) => {
        console.log(data);

    })
    showToast("Email Sent");
    sharingContainer.style.display = 'none';
    fileChip.style.display = 'none';
})

let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%, 0)";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%, 60px)";
    }, 2000);
}