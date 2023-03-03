if (window.location.href.includes("s?k") 
    || window.location.href.includes("s?") 
    || window.location.href.includes("/b/") 
    || window.location.href.includes("/b?")) {
    
    // check if page has dropdown sort selector
    // https://www.amazon.com/s?k=tent&rh=n%3A3147471&ref=nb_sb_noss
    let selector = document.querySelector(".s-desktop-toolbar .a-dropdown-container");

    // https://www.amazon.com/b/ref=dp_bc_aui_C_2?ie=UTF8&node=18457661011
    if (!selector) {
        selector = document.getElementById("searchSortForm");
    }

    if (selector) {
        const button = document.createElement("button");
        button.innerHTML = `Sort by Review Count`;
        button.id = "sort-by-review-count";
        button.className = "sort-by-review-count";
        selector.insertAdjacentHTML("beforeend", button.outerHTML);
        document.getElementById("sort-by-review-count").addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = sortUrl(window.location.href);
        });
    }
}
