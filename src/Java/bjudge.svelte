<script>
  export let page;

  let resultList = [];

  async function solvedList() {
    let list = [];
    let result = fetch('http://localhost:8080/b_judge/' + page,
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
  }

  solvedList();
</script>


<!-- Page Header -->
<header class="masthead" style="background-image: url('/Java/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="site-heading">
            <h1>백 준</h1>
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
	      <thread>
		     <tr style="background-color: rgb(230, 230, 230); text-align: center;">
		       <th width="30%"><b>번 호</b></th>
		       <th width="70%"><b>문 제</b></th>
		     </tr>
	      </thread>
            {#each resultList as item}
              <tbody style="text-align: center;">
                <td><hr>&nbsp;<br>{item.no}<br>&nbsp;</td>
                <td><hr>&nbsp;<br><a href="/b_judge/view/{item.no}">{item.title}</a><br>&nbsp;</td>
              </tbody>
            {/each}
        </table>
        
        
        <!-- Pager -->
        <hr>
        
      </div>
    </div>
  </div>