<script>
  import {onMount} from 'svelte';
  import { afterUpdate } from 'svelte';
  import { beforeUpdate } from 'svelte';
  export let divi;

  let max;
  let resultList = [];
  let paging = [];
  let url;

  
  function change(page) {
    let p = page * 12;
    for (var i = 0; i < resultList.length; i++) {
      document.getElementsByClassName('display'+i)[0].style.display="none";
    }
    for (var i = p; i < p + 12; i++) {
      if (resultList.length > i) {
        document.getElementsByClassName('display'+i)[0].style.display="";
      }
    }
  }
  
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
    document.getElementById('loading-bar').remove();
    resultList = list.list;
    max = list.max[0].no;
      
    let empty = [];
    for (var i = 1; i <= Math.ceil(max / 12); i++) {
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
    background-color: rgba(0, 0, 0, 0);
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
    margin-bottom: 3%;
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
      <div class="loading-container" id="loading-bar">
        <div class="loading"></div>
        <div id="loading-text">loading</div>
      </div>
        <!-- if else 문에서 공통된 부분을 빼서 처리하려고 해도 <div>와 같은 HTML 태그가 종료되지 않으면 if else 문에서 에러가 남..-->
        {#each resultList as item, i}
          {#if i < 12}
            <div class="col-lg-3 col-md-6 mb-3 card display{i}" onClick="location.href='/board/{url}/{item.pk}'">
              <div class="card-body">
                <div class="card-title">
                  <b>{item.title}</b>
                </div>
                <div class="card-content">
                  {#if divi == 'noticeboards'}
                    {@html item.content.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)}
                  {:else}
                    {item.tag}
                  {/if}
                </div>
              </div>
              <div class="card-buttom">
                <div class="card-date">
                  {item.date}
                </div>
              </div>
            </div>
          {:else}
            <div class="col-lg-3 col-md-6 mb-3 card display{i}" onClick="location.href='/board/{url}/{item.pk}'" style="display: none">
              <div class="card-body">
                <div class="card-title">
                  <b>{item.title}</b>
                </div>
                <div class="card-content">
                  {#if divi == 'noticeboards'}
                    {@html item.content.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)}
                  {:else}
                    {item.tag}
                  {/if}
                </div>
              </div>
              <div class="card-buttom">
                <div class="card-date">
                  {item.date}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>

    <div class="clearfix">
      <div id="b_dv" style="text-align: center">
        {#each paging as item}
          <input class="custom-btn" type="button" value="{item.no}" on:click={change(item.no-1)}>&nbsp;
        {/each}
      </div>
    </div>