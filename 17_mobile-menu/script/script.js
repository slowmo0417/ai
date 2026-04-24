$(function () {
  $("button").click(function () {
    $(".cover").fadeIn(300);
    $(".mobile-menu").animate({ right: 0 }, 300);
  });

  $(".close").click(function () {
    $(".mobile-menu").animate({ right: "-100%" }, 300);
    $(".cover").fadeOut(300);
  });
});
