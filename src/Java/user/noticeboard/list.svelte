<script>
  import {onMount} from 'svelte';
  export let page;
  export let divi;

  let max;
  let resultList = [];
  let paging = [];

  onMount(async() => {
    resultList = [];
    paging = [];
    let list = [];
    let result = fetch('http://localhost:8080/noticeboard/list/' + page,
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
      for (var i = 1; i <= Math.ceil(max / 10); i++) {
        empty.push({no : String(i)});
      }

      paging = empty; //왜인지 모르겠으나 empty 변수를 지정하지 않고 paging 변수에 데이터를 push 하는 경우 프론트에서 출력이 안됨..
  })
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
              {#if divi == 'baekjoon'}
                백 준
              {:else if divi == 'programmers'}
                프로그래머스
              {:else if divi == 'noticeboard'}
                게 시 판
              {:else}

              {/if}
            </h2>
            <br>
            {#if divi == 'noticeboard'}
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
  <div class="container">
    <div class="row">
      <div class="col-lg-8 col-md-10 mx-auto">
        <table width="100%;" id="tbl">
          {#if divi == 'noticeboard'}
            {#each resultList as item}
              <hr>
              <div class="post-preview" onclick="location.href='/noticeboard/view/{item.pk}'" style="cursor: pointer;">
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
                <td><hr>&nbsp;<br><a href="/noticeboard/view/{item.pk}">{item.title}</a><br>&nbsp;</td>
              </tbody>
            {/each}
          {/if}
          <div class="loading-container" id="loading-bar">
            <div class="loading"></div>
            <div id="loading-text">loading</div>
          </div>
        </table>


        <!-- Pager -->
        <hr>
        <br>
        <div class="clearfix page_wrap">
          <div id="b_dv" class="page_nation" style="text-align: center">

            <a class="arrow pprev" href="#" onclick="location.href='/noticeboard/list/1'"></a>
            {#if page <= 1}
                <a class="arrow prev" href="#" onclick="location.href='/noticeboard/list/1'"></a>
            {:else}
                <a class="arrow prev" href="#" onclick="location.href='/noticeboard/list/{Number(page)-Number(1)}'"></a>
            {/if}

            {#each paging as item}
                {#if page == item.no}
                        <a class="active" href="#" onclick="location.href='/noticeboard/list/{item.no}'">{item.no}</a>
                {:else}
                        <a href="#" onclick="location.href='/noticeboard/list/{item.no}'">{item.no}</a>
                {/if}
<!--
              <input type="button" value="{item.no}" onclick="location.href='/noticeboard/list/{divi}/{item.no}'">&nbsp;
              -->
            {/each}

            {#if page >= Math.ceil(max / 10)}
                <a class="arrow next" href="#" onclick="location.href='/noticeboard/list/{Math.ceil(max / 10)}'"></a>
            {:else}
                <a class="arrow next" href="#" onclick="location.href='/noticeboard/list/{Number(page)+Number(1)}'"></a>
            {/if}
            <a class="arrow nnext" href="#" onclick="location.href='/noticeboard/list/{Math.ceil(max / 10)}'"></a>

          </div>
        </div>
      </div>
    </div>
  </div>
  <br>
  <hr>

<!-- {@html item.content.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)} -->