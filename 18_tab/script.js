$(function () {
  $(".tab li").click(function () {
    let num = $(this).index();
    console.log(num);
    // 기존 on class 삭제
    $(".tab li").removeClass("on");
    $(this).addClass("on");
    $(".list_wrap").hide();
    $(".list_wrap").eq(num).show();
  });
});
