<script>
  import {onMount} from 'svelte';
  export let divi;
  export let no;

  let max;
  let resultList = [];
  let paging = [];

  onMount(async() => {
    resultList = [];
    paging = [];
    let list = [];
    let result = fetch('http://localhost:8080/project/' + no,
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
    resultList = list.list[0];
    resultList.info = resultList.info.replace(/(?:\r\n|\r|\n)/g,'<br/>');
  })
</script>

<style>
  .row {
    font-size: 17px;
  }
  .sub {
    font-size: 20px;
    text-align: center;
  }
  .long {
    font-size: 17px;
    text-align: left;
  }
  .short {
    font-size: 17px;
    text-align: center;
  }
  .short > div {
    width: 45%;
    justify-content: center;
    display: inline-block;
    vertical-align: middle;
  }
  .area {
    padding: 2%;
    border-radius: 10px;
    box-shadow: 0 0 0 1px #e1e1e1 inset;
  }
</style>
  
<header class="masthead" style="background-image: url('/Java/image/post-bg.jpg')">
  <div class="overlay"></div>
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-md-10 mx-auto">
        <div class="post-heading">
          
          <h2>{ resultList.title }</h2>
          <br>
          <span class="meta">
            프로젝트 분류 : 
            {#if resultList.division == 'company'}
            회사 프로젝트
            {:else if resultList.division == 'personal'}
            개인 프로젝트
            {:else}
            교내 프로젝트
            {/if}
            ({resultList.startDate} ~ {resultList.endDate})
          </span>
            
          <!--<h1>${ item.title }</h1>-->
          <br>
          <!-- <h2 class="subheading">Problems look mighty small from 150 miles up</h2> -->
          <!--<span class="meta">Posted by ${ item.writer } on ${ item.date }</span>-->
        </div>
      </div>
    </div>
  </div>
</header>

<!-- Post Content -->
<article>
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-md-10 mx-auto view sub">
        <div class="area">
          <div class="sub">
            <b>알림</b>
            <hr style="width: 15%;">
          </div>
          <div class="short">
            {resultList.notification}
          </div>
        </div>
        <br>
        <div class="area">
          <div class="sub">
            <b>참여인원 / 기술스택</b>
            <hr style="width: 15%;">
          </div>
          <div class="short">
            <div>
              {@html resultList.people}
            </div>
            <div>
              {@html resultList.techStack}
            </div>
          </div>
        </div>
        <br>
        <div class="area">
          <div class="sub">
            <b>프로젝트 소개</b>
            <hr style="width: 15%;">
          </div>
          <div class="long">
            {@html resultList.info}
          </div>
        </div>
        <br>
        <div class="area">
          <div class="sub">
            <b>작업내용</b>
            <hr style="width: 15%;">
          </div>
          <div class="long">
            {@html resultList.myJob}
          </div>
        </div>
        <br>
        <div class="area">
          <div class="sub">
            <b>문제점</b>
            <hr style="width: 15%;">
          </div>
          <div class="long">
            {@html resultList.problem}
          </div>
        </div>
        <br>
        <div class="area">
          <div class="sub">
            <b>참조 사이트</b>
            <hr style="width: 15%;">
          </div>
          <div class="short">
            <a href="{resultList.reference}">{resultList.reference}</a>
          </div>
        </div>
        <br>
      </div>
    </div>
    <br>
  </div>
  <hr>
</article>