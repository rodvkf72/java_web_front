<script>
  import { onMount } from "svelte";

  //import {onMount} from 'svelte';
  let page = 1;

  $: promise = fetch(`http://localhost:8080/board/list/${page}`,
    {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json",
      }
    }
  ).then((res) => {
    return res.json();
  }).then((result) => {
    //console.log("123");
    //console.log(result);
    //paging(result);
    findMax(result);
    return result;
  })


  let max = 1;
  
  function findMax(result) {
    max = Math.ceil(result.max[0].no / 10);
  }
 
  function firstPage() {
    page = 1;
  }

  function prevPage() {
    page = page - 1;
  }

  function nextPage() {
    page = page + 1
  }

  function movePage(no) {
    page = no;
  }

  /*
  function jump(item) {
    console.log(item);
    console.log(item.no);
    page = item.no;
  }
  */

</script>

<style>
  .page_wrap {
    text-align:center;
    font-size:0;
  }

  .image-box {
    width: 40%;
    height: 200px;
    display: inline-block;
  }

  .content-box {
    position: relative;
    width: 54%;
    height: 200px;
    display: inline-table;
    vertical-align: top;
  }

  .post-title {
    margin: auto;
    text-align: center;
    width: 80%;
    height: 65%;
  }

  .post-title p {
    font-size: 20px;
    text-overflow: hidden;
    margin-top: 30px;
    word-break: break-all;
  }

  .post-writer {
    margin-top: -7%;
    margin-right: -8%;
    text-align: center;
  }

  .post-writer p {
    font-size: 15px;
    text-overflow: hidden;
    color: gray;
    word-break: break-all;
  }

  .post-preview:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
</style>

<!-- Page Header -->
<header class="masthead" style="background-image: url('/Java/image/wale.jpg')">
  <div class="overlay"></div>
  <div class="container">
    <div class="row">
      <div class="col-lg-10 col-md-10 mx-auto">
        <div class="site-heading">
          <h2>
            게시판
          </h2>
          <br>
          <span class="subheading">잡동사니 저장소</span>
        </div>
      </div>
    </div>
  </div>
</header>

<!-- Main Content -->
<div class="container">
  <div class="row">
    <div class="col-lg-8 col-md-10 mx-auto">
      <table width="100%;" id="tbl">
        {#await promise}
          <div class="loading-container" id="loading-bar">
            <div class="loading"></div>
            <div id="loading-text">loading</div>
          </div>
        {:then promise}
          {#each promise.list as item, index}
            <hr>
            <div class="post-preview" onclick="location.href='/board/{item.pk}'" style="cursor: pointer;">
              <div class="image-box">
                <img src="https://blog.jinbo.net/attach/615/200937431.jpg" style="width: 100%; height: 100%;" alt="thumb"/>
              </div>
              <div class="content-box">
                <div class="post-title">
                  <p>{item.title}</p>
                </div>
                <div class="post-writer">
                  <!--<p>Posted by {item.writer} on {item.date}</p>-->
                  <p>{item.date}</p>
                </div>
              </div>
            </div>
          {/each}
        {:catch error}
          <p>서버가 아파요 ㅠㅠ</p>
        {/await}
      </table>

      <!-- Pager -->
      <hr>
      <br>
      <div id="b_dv_top" class="clearfix page_wrap">
        <div id="b_dv" class="page_nation" style="text-align: center">
          {#await promise}
            <p></p>
          {:then}
            <!-- 이전 페이지 커서 -->
            <a class="arrow pprev" href="#null" on:click={firstPage}></a>
            {#if page <= 1}
              <a class="arrow prev" href="#null" on:click={firstPage}></a>
            {:else}
              <a class="arrow prev" href="#null" on:click={prevPage}></a>
            {/if}

            <!-- 숫자 버튼 -->
            {#each {length: max} as _, i}
              {#if page == i+1}
                <a class="active" href="#null" on:click={() => movePage(i+1)}>{i+1}</a>
              {:else}
                <a href="#null" on:click={() => movePage(i+1)}>{i+1}</a>
              {/if}
            {/each}

            <!-- 다음 페이지 커서 -->
            {#if page >= max}
              <a class="arrow next" href="#null" on:click={() => movePage(max)}></a>
            {:else}
              <a class="arrow next" href="#null" on:click={nextPage}></a>
            {/if}
            <a class="arrow nnext" href="#null" on:click={() => movePage(max)}></a>

          {:catch error}
            <p></p>
          {/await}
        </div>
      </div>
    </div>
  </div>
</div>
<br>
<hr>
