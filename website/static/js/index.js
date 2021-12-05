

const myTimer = () =>{
    const hideAllert = document.querySelectorAll(".show");
    for (const temp of hideAllert){
        temp.classList.add('hide');
    }
}


const openButton = document.querySelector(".open");
const closeButton = document.querySelector(".close");

openButton.addEventListener('click', event =>{
    openButton.classList.add('hide');
})
closeButton.addEventListener('click', event =>{
    openButton.classList.remove('hide')
})


setTimeout(myTimer, 2000);