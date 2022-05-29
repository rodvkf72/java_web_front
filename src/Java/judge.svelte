<script>
  import {onMount} from 'svelte';
  export let page;
  export let divi;

  let resultList = [];

  onMount(async() => {
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
  })
</script>


<!-- Page Header -->
<header class="masthead" style="background-image: url('/Java/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="site-heading">
            <h1>
              {#if divi == 'b_judge'}
                백 준
              {:else if divi == 'p_judge'}
                프로그래머스
              {:else}
                
              {/if}
              백 준
            </h1>
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
              <td><hr>&nbsp;<br><a href="/coding/{divi}/view/{item.no}">{item.title}</a><br>&nbsp;</td>
            </tbody>
          {/each}
        </table>
        
        
        <!-- Pager -->
        <hr>
        
      </div>
    </div>
  </div>