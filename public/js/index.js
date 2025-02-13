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

let host = 'https://sendeasy.onrender.com';
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
    bgProgressContainer.style.display = 'block';
    const file = fileInput.files[0];
    const formData = new FormData;
    const xhr = new XMLHttpRequest();

    formData.append("myfile", file);

    
    
    xhr.onreadystatechange = () => {
        //console.log(xhr.readyState);
        showLink(JSON.parse(xhr.response));
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            //console.log("File uploaded successfully");
        } else {
            //console.error("File upload failed");
        }
    };

    // Define what happens in case of an error
    xhr.onerror = function () {
        //console.error("An error occurred while uploading the file.");
        showToast("Error while Uploading");
    };

    xhr.upload.onprogress = (e) => {
        if(e.lengthComputable){
            let percent = (e.loaded/e.total) * 100;
            //console.log(`Total uploaded ${percent}%`);
            bgProgress.style.width = `${percent}%`;
            percentV.innerText = percent.toFixed(2);
            progressBar.style.width = `${percent}%`;

            if (percent >= 100) {
                // Hide the progress container after a short delay (for smooth transition)
                setTimeout(() => {
                    document.querySelector('.bg-progress-container').style.display = 'none';
                    sharingContainer.style.display = 'block';
                }, 500);
                
            }
            
        }
    }

    xhr.open('POST', uploadURL, true);
    xhr.send(formData);
    
}

const showLink = ({file: url}) => {
    fileURL.value = url;
    //console.log(url);
}

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