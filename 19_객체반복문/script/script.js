$(function () {
  // 서버에서 영화 data 가져오는 배열 변수
  let movieData = [];

  // 이미지 불러오기
  let imgUrl = "https://image.tmdb.org/t/p/original";

  // api 서버에 data를 요청해서 json 형식으로 가져오는 함수
  const getMovieData = async () => {
    let url =
      "https://api.themoviedb.org/3/movie/now_playing?api_key=092700188f3faf189063d03368af949e&language=ko-KR&region=KR&page=1";

    console.log(url);

    let response = await fetch(url);
    let data = await response.json();

    movieData = data.results;

    render();
  };

  const render = () => {
    let movieCard = "";

    movieData.map((item) => {
      movieCard += `
        <li>
          <a href="#">
            <div class="imgbox">
              <img
                src="${imgUrl}${item.poster_path}"
                alt="${item.title}"
              />
            </div>

            <div class="txt">
              <h3>${item.title}</h3>

              <p>
                <span>평점: ${item.vote_average}</span>
                <span>개봉일: ${item.release_date}</span>
              </p>

              <div class="btn_wrap">
                <button class="btn_like">♡ ${item.vote_count}</button>
                <button class="btn_date">예매</button>
                <button class="btn_cinema">CINEMA</button>
              </div>
            </div>
          </a>
        </li>
      `;
    });

    // 자바스크립트에서 작업한 변수를 ul에 삽입
    let list = document.getElementById("list");
    list.innerHTML = movieCard;
  };

  getMovieData();
});
