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
        <div class="sub">
          <b>알림</b>
          <hr style="width: 15%;">
        </div>
        <div class="short">
          {resultList.notification}
        </div>
        <br><br><br>
        <div class="sub">
          <b>프로젝트 소개</b>
          <hr style="width: 15%;">
        </div>
        <div class="long">
          {@html resultList.info}
        </div>
        <br><br><br>
        <div class="sub">
          <b>참여인원</b>
          <hr style="width: 15%;">
        </div>
        <div class="short">
          {@html resultList.people}
        </div>
        <br><br><br>
        <div class="sub">
          <b>기술스택</b>
          <hr style="width: 15%;">
        </div>
        <div class="short">
          {@html resultList.techStack}
        </div>
        <br><br><br>
        <div class="sub">
          <b>작업내용</b>
          <hr style="width: 15%;">
        </div>
        <div class="long">
          {@html resultList.myJob}
        </div>
        <br>
        <div class="sub">
          <b>문제점</b>
          <hr style="width: 15%;">
        </div>
        <div class="long">
          {@html resultList.problem}
        </div>
        <br><br><br>
        <div class="sub">
          <b>참조 사이트</b>
          <hr style="width: 15%;">
        </div>
        <div class="short">
          <a href="{resultList.reference}">{resultList.reference}</a>
        </div>
        <br>
      </div>
    </div>
    <br>
  </div>
  <hr>
</article>