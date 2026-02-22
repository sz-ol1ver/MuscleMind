document.addEventListener("DOMContentLoaded", () => {
    const purposeButtons = document.querySelectorAll(".purpose");

    purposeButtons.forEach(button => {
        button.addEventListener("click", ()=>{
            const parentBlock = this.closest(".questions");
            
            parentBlock.querySelectorAll(".purpose").forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");
        });
    });
});