document.addEventListener("DOMContentLoaded", () => {
    const purposeButtons = document.querySelectorAll(".purpose")

    purposeButtons.forEach(button => {
        button.addEventListener("click", ()=>{
            const clickedButton = event.currentTarget;
            const parentBlock = clickedButton.closest(".questions")
            if(parentBlock){
                parentBlock.querySelectorAll(".purpose").forEach(btn =>{
                    btn.classList.remove("active")
                })
                clickedButton.classList.add("active")
            }
        });
    });
});