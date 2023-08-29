<script>
  //import {onMount} from 'svelte';
  let page = 1;

  $: items = fetch(`http://localhost:8080/board/list/${page}`,
    {
      method: 'POST',
      headers: {
        "Content-Type" : "application/json",
      }
    }
  ).then(
    response => response.json()
  );

  function firstPage() {
    page = 1;
  }

  function prevPage() {
    page = page - 1;
  }

  function nextPage() {
    page = page + 1;
  }

  function jump(item) {
    page = item.no;
  }

</script>

<style>
  .page_wrap {
        text-align:center;
        font-size:0;
  }
  .page_nation {
    display:inline-block;
  }
  .page_nation .none {
    display:none;
  }
  .page_nation a {
    display:block;
    margin:0 3px;
    float:left;
    border:1px solid #e6e6e6;
    width:28px;
    height:28px;
    line-height:28px;
    text-align:center;
    background-color:#fff;
    font-size:13px;
    color:#999999;
    text-decoration:none;
  }
  .page_nation .arrow {
    border:1px solid #ccc;
  }
  .page_nation .pprev {
    background:#f8f8f8 url('/Java/image/page_pprev.png') no-repeat center center;
    margin-left:0;
  }
  .page_nation .prev {
    background:#f8f8f8 url('/Java/image/page_prev.png') no-repeat center center;
    margin-right:7px;
  }
  .page_nation .next {
    background:#f8f8f8 url('/Java/image/page_next.png') no-repeat center center;
    margin-left:7px;
  }
  .page_nation .nnext {
    background:#f8f8f8 url('/Java/image/page_nnext.png') no-repeat center center;
    margin-right:0;
  }
  .page_nation a.active {
    background-color:#42454c;
    color:#fff;
    border:1px solid #42454c;
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
    margin-right: -8%;
    text-align: center;
    height: 65%;
    vertical-align: top;
  }

  .post-title p {
    font-size: 20px;
    text-overflow: hidden;
    margin-top: 30px;
    word-break: break-all;
  }

  .post-writer {
    margin-right: -8%;
    text-align: center;
    height: 35%;
    vertical-align: bottom;
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
          {#await items}
            <div class="loading-container" id="loading-bar">
              <div class="loading"></div>
              <div id="loading-text">loading</div>
            </div>
          {:then items}
            {#each items as item, index}
              <hr>
              <div class="post-preview" onclick="location.href='/board/noticeboard/view/{item.pk}'" style="cursor: pointer;">
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
            <p>{error}</p>
          {/await}
        </table>

        <!-- Pager -->
        <hr>
        <br>
        <div class="clearfix page_wrap">
          <div id="b_dv" class="page_nation" style="text-align: center">
            {#await items}
              <p></p>
            {:then items}
              <!-- 이전 페이지 커서 -->
              <a class="arrow pprev" href="#null" onclick={firstPage}></a>
              {#if page <= 1}
                <a class="arrow prev" href="#null" onclick={firstPage}></a>
              {:else}
                <a class="arrow prev" href="#null" onclick={prevPage}></a>
              {/if}

              <!-- 숫자 버튼 -->
              {#each items as item, index}
                {#if page == item.no}
                  <a class="active" href="#null" onclick={jump({item})}></a>
                {:else}
                  <a href="#null" onclick={jump({item})}></a>
                {/if}
              {/each}

              <!-- 다음 페이지 커서 -->
              {#if page >= Math.ceil(items.max / 10)}
                <a class="arrow next" href="#null" onclick={jump(Math.ceil(items.max / 10))}></a>
              {:else}
                <a class="arrow next" href="#null" onclick={nextPage}></a>
              {/if}
              <a class="arrow nnext" href="#null" onclick={jump(Math.ceil(items.max / 10))}></a>

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

<!-- {@html item.content.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)} -->