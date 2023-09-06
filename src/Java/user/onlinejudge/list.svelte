<script>
  import {onMount} from 'svelte';
  export let divi;
  let page = 1;

  $: items = fetch(`http://localhost:8080/onlinejudge/${divi}/list/${page}`,
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
              {#if divi == 'baekjoon'}
                백 준
              {:else if divi == 'programmers'}
                프로그래머스
              {:else}
                잘못된 페이지
              {/if}
            </h2>
            <br>
            <span class="subheading">문 제 풀 이</span>
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
            <tr style="background-color: rgb(230, 230, 230); text-align: center;">
              <th>
                <b>번 호</b>
              </th>
              <th>
                <b>문 제</b>
              </th>
            </tr>
            {#each items as item, index}
              <tbody style="text-align: center;">
                <td><hr>&nbsp;<br>{item.no}<br>&nbsp;</td>
                <td><hr>&nbsp;<br><a href="/onlinejudge/{divi}/{item.pk}">{item.title}</a><br>&nbsp;</td>
              </tbody>
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