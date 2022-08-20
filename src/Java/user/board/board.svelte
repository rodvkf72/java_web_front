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
    let result = fetch('http://localhost:8080/' + divi + '/' + page,
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
    max = list.max[0].no;
      
      let empty = [];
      for (var i = 1; i <= Math.ceil(max / 10); i++) {
        empty.push({no : String(i)});
      }
      
      paging = empty; //왜인지 모르겠으나 empty 변수를 지정하지 않고 paging 변수에 데이터를 push 하는 경우 프론트에서 출력이 안됨..
  })
</script>


<!-- Page Header -->
<header class="masthead" style="background-image: url('/Java/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
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
              <div class="post-preview">
                  <a href="/noticeboard/view/{item.no}">
                      <p class="post-title" style="text-align: center">
                          {item.title}
                      </p>
                  </a>
                  <p class="post-meta" style="text-align: right">Posted by 
                      <a href="#">{item.writer}</a>
                      on {item.date}
                  </p>
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
                <td><hr>&nbsp;<br><a href="/board/{divi}/view/{item.no}">{item.title}</a><br>&nbsp;</td>
              </tbody>
            {/each}
          {/if}
          
        </table>
        
        
        <!-- Pager -->
        <hr>
        <div class="clearfix">
          <div id="b_dv" style="text-align: center">
            {#each paging as item}
              <input type="button" value="{item.no}" onclick="location.href='/board/{divi}/{item.no}'">&nbsp;
              <!--
              {#if cnt <= max}
                <input type="button" value="{item}" onclick="location.href='/noticeboard/{item}'">&nbsp;
              {/if}
              -->
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>