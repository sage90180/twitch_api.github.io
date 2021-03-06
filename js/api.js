const apiUrl = 'https://api.twitch.tv/kraken';
const errorMessage = 'Error';
const id = 'wn8pirkwzemy6ouh1xhj2m7ccym946';
// 載入更多
let pageOffset = 21;

function getApiData(cb, taken) {
  const request = new XMLHttpRequest();
  request.open('GET', `${apiUrl}${taken}`, true);
  request.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  request.setRequestHeader('Client-ID', id);

  request.onload = () => {
    if (request.status >= 200 && request.status < 400) {
      const data = JSON.parse(request.responseText);
      cb(data);
    } else {
      alert(errorMessage);
    }
  };
  request.onerror = () => {
    alert(errorMessage);
  };
  request.send();
}

function videoData(videos) {
  const videoImgs = videos.streams.map(img => img.preview.large);
  const logos = videos.streams.map(logo => logo.channel.logo);
  const status = videos.streams.map(status => status.channel.status);
  const names = videos.streams.map(name => name.channel.name);
  const links = videos.streams.map(link => link.channel.url);
  const views = videos.streams.map(view => view.viewers);
  const videoData = {
    videoImgs,
    logos,
    status,
    names,
    links,
    views,
  };
  return videoData;
}

function display(video) {
  for (let i = 0; i < 21; i += 1) {
    const div = document.createElement('div');
    div.classList.add('channel');
    div.innerHTML = `
    <div class="viwes">
      <i class="far fa-eye"></i>
      <div class="views_num">${video.views[i]}</div>
    </div>
    <a href="${video.links[i]}" target="_blank">
      <img class="video" src="${video.videoImgs[i]}" alt=""/>
    </a>
    <div class="channel_info">
      <img class="picture" src="${video.logos[i]}" alt=""/>
      <div class="info_area">
        <h3>${video.status[i]}</h3>
        <a class="name" href="${video.links[i]}" target="_blank">${video.names[i]}</a>
      </div>
      <div class="hoverLine"> </div>
    </div>`;
    document.querySelector('.channels').appendChild(div);
  }
}

// navbar 選項、載入視頻
getApiData((data) => {
  const topGames = data.top.map(game => game.game.name);
  for (const game of topGames) {
    const li = document.createElement('li');
    li.classList.add('nav_item');
    li.innerHTML = `<li class="nav_item"><a href="#" data-item="${game}">${game}</a></li>`;
    document.querySelector('.navbar').append(li);
    document.querySelector('.game_name').innerText = topGames[0];
  }
  getApiData((data) => {
    const videoInfo = videoData(data);
    display(videoInfo);
  }, `/streams/?game=${encodeURIComponent(topGames[0])}&limit=21`);
}, '/games/top?limit=5');

document.querySelector('.navbar').addEventListener('click', (e) => {
  pageOffset = 21;
  const gameName = e.target.innerText;
  // 改 title 遊戲名
  document.querySelector('.game_name').innerText = e.target.innerText;
  // 改 title 名次
  getApiData((data) => {
    const topGames = data.top.map(game => game.game.name);
    const rank = topGames.indexOf(e.target.getAttribute('data-item'));
    document.querySelector('.game_name').setAttribute('data-rank', rank + 1);
  }, '/games/top?limit=5');
  // 載入影片
  getApiData((data) => {
    document.querySelector('.channels').innerHTML = '';
    display(videoData(data));
  }, `/streams/?game=${encodeURIComponent(gameName)}&limit=21`);
});
document.getElementById('load_more').addEventListener('click', () => {
  const gameName = document.querySelector('.game_name').innerText;
  getApiData((data) => {
    display(videoData(data));
  }, `/streams/?game=${encodeURIComponent(gameName)}&limit=21&offset=${pageOffset}`);
  pageOffset += 21;
});
