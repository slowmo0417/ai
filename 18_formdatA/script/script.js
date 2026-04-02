const scriptURL =
  "https://script.google.com/macros/s/AKfycbyocCXnPBryvzDDTYv8F77_0fQu6fnFgx5FafHqmhaEz24hHclcVpaRtAg6uAXCFgKa/exec"; // add your own app script link here
const form = document.forms["sheet1"];
const msg = document.getElementById("msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then((response) => {
      msg.innerHTML = "Message sent successfully";
      setTimeout(function () {
        msg.innerHTML = "";
      }, 5000);
      form.reset();
    })
    .catch((error) => console.error("Error!", error.message));
});
