<script>
  import {onMount} from 'svelte';
  export let divi;

  let max;
  let resultList = [];
  let paging = [];
  let url;

  onMount(async() => {
    resultList = [];
    paging = [];
    let list = [];
    let result = fetch('http://localhost:8080/board/' + divi,
      {
        method: 'POST',
        headers: {
          "Content-Type" : "application/json",
        }
      }
    ).then((res) => {
      return res.json();
    }).then((json) => {
      list = json;
    });

    await result;
    resultList = list.list;
    console.log(resultList[0].content.split("<p>")[1]);
    max = list.max[0].no;
      
    let empty = [];
    for (var i = 1; i <= Math.ceil(max / 10); i++) {
      empty.push({no : String(i)});
    }
    
    paging = empty; //왜인지 모르겠으나 empty 변수를 지정하지 않고 paging 변수에 데이터를 push 하는 경우 프론트에서 출력이 안됨..

    if (divi == 'noticeboards') {
      url = 'noticeboard';
    } else if (divi == 'baekjoons') {
      url = 'baekjoon';
    } else {
      url = 'programmer';
    }
  })
</script>

<style>
  @media (max-width: 767px) {
    .card {
      display: flex;
      justify-content: left;
      position: relative;
      width: 80%;
      line-height: 1.6;
      font-size: 0.8em;
      background-color: rgba(0, 0, 0, 0.01);
      margin: auto;
      padding: 1%;
      cursor: pointer;
    }
  }
  .card-parent {
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
    position: relative;
  }

  .card {
    line-height: 1.6;
    font-size: 0.8em;
    background-color: rgba(0, 0, 0, 0.01);
    box-shadow: 0 0 0 1px #e1e1e1 inset;
    border-radius: 10px;
    cursor: pointer;
  }

  .card-body {
    padding: 1em;
  }

  .card-content {
    position: relative;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-date {
    font-size: 0.8em;
  }
</style>

<!-- Page Header -->
<header class="masthead" style="background-image: url('/Java/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="site-heading">
            <h2>
              {#if divi == 'baekjoons'}
                백 준
              {:else if divi == 'programmers'}
                프로그래머스
              {:else if divi == 'noticeboards'}
                게 시 판
              {:else}
                
              {/if}
            </h2>
            <br>
            {#if divi == 'noticeboards'}
              <span class="subheading">잡동사니 저장소</span>
            {:else}
              <span class="subheading">문 제 풀 이</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div style="width: 80%; text-align: center; margin: auto;">
    <div class="card-parent">
        {#each resultList as item}
            <div class="col-lg-3 col-md-6 mb-3 card" onClick="location.href='/board/{url}/{item.pk}'">
            <div class="card-body">
              <div class="card-title">
                <b>{item.title}</b>
              </div>
              <div class="card-content">
                {@html item.content.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)}
              </div>
            </div>
            <div class="card-buttom">
              <div class="card-date">
                {item.date}
              </div>
            </div>
          </div>
        {/each}
      

<!--
        {@html item.content.split("<p>")[1]}
      <div class="col-lg-8 col-md-10 mx-auto">
        <table width="100%;" id="tbl">
          {#if divi == 'noticeboard'}
            <div class="row">
            {#each resultList as item}
              <hr>
              <div class="post-preview">
                  <a href="/board/noticeboard/view/{item.pk}">
                      <p class="post-title" style="text-align: center">
                          {item.title}
                      </p>
                  </a>
                  <p class="post-meta" style="text-align: right">Posted by 
                      <a href="#">{item.writer}</a>
                      on {item.date}
                  </p>
              </div>
              <div class="col-lg-4 col-md-6 mb-4" style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 10%; height: 10%;">
                <div class="card h-20">
                  <img class="card-img-top" src="../../resources/image/pop_bg.png" alt="">
                  <div class="card-body">
                    <h4 class="card-title">
                      <a href="/board/noticeboard/view{item.pk}">캐시나무</a>
                    </h4>
                    <h5>{item.date}</h5>
                    <p class="card-text">{@html item.content.split("<p>")[1]}</p>
                  </div>
                </div>
              </div>
            {/each}
            </div>
          {:else}
            <tr style="background-color: rgb(230, 230, 230); text-align: center;">
              <th>
                <b>번 호</b>
              </th>
              <th>
                <b>문 제</b>
              </th>
            </tr>
            {#each resultList as item}
              <tbody style="text-align: center;">
                <td><hr>&nbsp;<br>{item.no}<br>&nbsp;</td>
                <td><hr>&nbsp;<br><a href="/board/{divi}/view/{item.no}">{item.title}</a><br>&nbsp;</td>
              </tbody>
            {/each}
          {/if}
          
        </table>
-->        
        
        <hr>
        <div class="clearfix">
          <div id="b_dv" style="text-align: center">
            {#each paging as item}
              <input type="button" value="{item.no}" onclick="location.href='/board/{divi}/{item.no}'">&nbsp;
            {/each}
          </div>
        </div>
      </div>
      
    </div>