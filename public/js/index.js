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
    uploadFile();
});

fileBtn.addEventListener('click', () => {
    fileInput.click();
});

copyBtn.addEventListener('click', () => {
    fileURL.select();
    // Temporarily change the selection color
    //fileURL.style.setProperty('::selection', 'background: gray; color: white;');
    document.execCommand('copy');
    showToast("Link Copied");
    // Deselect the input after copying to avoid the blue highlight
    //window.getSelection().removeAllRanges();
});

const uploadFile = () => {
    if (!fileInput.files.length) {
        showToast("Please select a file");
        return;
    }
    bgProgressContainer.style.display = 'block';
    const file = fileInput.files[0];
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    formData.append("myfile", file);

    console.log("FormData Contents:");
    for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);  // Should log: "myfile", File object
    }

    console.log("Uploading File:", file);
    
    // Modify the success handler in xhr.onreadystatechange
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
        try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                console.log("✅ File uploaded successfully:", response);
                // Show sharing container ONLY after successful response
                bgProgressContainer.style.display = 'none';
                sharingContainer.style.display = 'block'; // Move this here
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

    // Define what happens in case of an error
    xhr.onerror = function () {
        //console.error("An error occurred while uploading the file.");
        showToast("Error while Uploading");
    };

    // Update the progress event handler
xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
        let percent = (e.loaded / e.total) * 100;
        bgProgress.style.width = `${percent}%`;
        percentV.innerText = percent.toFixed(2);
        progressBar.style.width = `${percent}%`;
    }
};

    xhr.open('POST', uploadURL, true);
    xhr.send(formData);
    
}

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