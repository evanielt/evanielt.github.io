var prevScrollpos = window.pageYOffset;

window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if(document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        document.getElementById("navbar").style.height = "0px";
    } else {
        document.getElementById("navbar").style.height = "50px";
    }
}