const list = document.querySelector(".list");
[...list.children].forEach(e => {
    e.addEventListener("click", item => {
        const childNumber = [...e.parentElement.children].indexOf(e) + 1;
        list.setAttribute("expand",childNumber);
    });
});