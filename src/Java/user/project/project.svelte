<script>
  import {onMount} from 'svelte';
  export let divi;

  let companyCnt;
  let personalCnt;
  let schoolCnt;
  let resultList = [];
  let companyResult = [];
  let personalResult = [];
  let schoolResult = [];
  let pagingCompany = [];
  let pagingPersonal = [];
  let pagingSchool = [];

  
  function change(division, page) {
    let p = page * 12;
    for (var i = 0; i < division+'Result'.length; i++) {
      document.getElementsByClassName(division+'Display'+i)[0].style.display="none";
    }
    for (var i = p; i < p + 12; i++) {
      if (division+'Result'.length > i) {
        document.getElementsByClassName(division+'Display'+i)[0].style.display="";
      }
    }
  }

  function pagingFunc(cnt, division) {
    for (var i = 1; i <= Math.ceil(cnt / 12); i++) {
      division.push({no : String(i)});
    }
    return division
  }

  onMount(async() => {
    resultList = [];
    let list = [];
    let result = fetch('http://localhost:8080/projects/',
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

    for (var i = 0; i < resultList.length; i++) {
      if (resultList[i].division == 'company') {
        companyResult.push(resultList[i]);
      } else if (resultList[i].division == 'personal') {
        personalResult.push(resultList[i]);
      } else {
        schoolResult.push(resultList[i]);
      }
    }
    companyResult = companyResult;
    personalResult = personalResult;
    schoolResult = schoolResult;

    companyCnt = list.max[0].pk;
    personalCnt = list.max[1].pk;
    schoolCnt = list.max[2].pk;

    pagingCompany = pagingFunc(companyCnt, pagingCompany);
    pagingPersonal = pagingFunc(personalCnt, pagingPersonal);
    pagingSchool = pagingFunc(schoolCnt, pagingSchool);
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
    margin-bottom: 3%;
    font-size: 0.8em;
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
              프로젝트
            </h2>
            <br>
              <span class="subheading">목록</span>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <div style="width: 80%; text-align: center; margin: auto;">
    
    {#if companyResult.length > 0}
      <b>회사 프로젝트</b>
      <hr style="width: 15%;">
    {/if}

    <div class="card-parent">
      {#each companyResult as item, i}
        <div class="col-lg-3 col-md-6 mb-3 card companyDisplay{i}" onClick="location.href='/project/{item.pk}'">
          <div class="card-body">
            <div class="card-title">
              <b>{item.title}</b>
            </div>
            <div class="card-content">
              {@html item.info.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)}
            </div>
          </div>
          <div class="card-buttom">
            <div class="card-date">
              {item.startDate} ~ {item.endDate}
            </div>
          </div>
        </div>
      {/each}
    </div>
    <div class="clearfix">
      <div id="b_dv" style="text-align: center">
        {#each pagingCompany as item}
          <input class="custom-btn" type="button" value="{item.no}" on:click={change('company', item.no-1)}>&nbsp;
        {/each}
      </div>
    </div>
    <br><br>
      
    {#if personalResult.length > 0}
      <b>개인 프로젝트</b>
      <hr style="width: 15%;">
    {/if}

    <div class="card-parent">
      {#each personalResult as item, i}
        <div class="col-lg-3 col-md-6 mb-3 card personalDisplay{i}" onClick="location.href='/project/{item.pk}'">
          <div class="card-body">
            <div class="card-title">
              <b>{item.title}</b>
            </div>
            <div class="card-content">
              {@html item.info.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)}
            </div>
          </div>
          <div class="card-buttom">
            <div class="card-date">
              {item.startDate} ~ {item.endDate}
            </div>
          </div>
        </div>
      {/each}
    </div>
    <div class="clearfix">
      <div id="b_dv" style="text-align: center">
        {#each pagingPersonal as item}
        <input class="custom-btn" type="button" value="{item.no}" on:click={change('personal', item.no-1)}>&nbsp;
        {/each}
      </div>
    </div>

    {#if schoolResult.length > 0}
      <b>교내 프로젝트</b>
      <hr style="width: 15%;">
    {/if}

    <div class="card-parent">
      {#each schoolResult as item, i}
        <div class="col-lg-3 col-md-6 mb-3 card schoolDisplay{i}" onClick="location.href='/project/{item.pk}'">
          <div class="card-body">
            <div class="card-title">
              <b>{item.title}</b>
            </div>
            <div class="card-content">
              {@html item.info.replace(/(<p[^>]+?>|<p>|<\/p>)/img, '').replace(/(<b[^>]+?>|<b>|<\/b>)/img, '').replace(/(<span[^>]+?>|<span>|<\/span>)/img, '').substring(0, 100)}
            </div>
          </div>
          <div class="card-buttom">
            <div class="card-date">
              {item.startDate} ~ {item.endDate}
            </div>
          </div>
        </div>
      {/each}
    </div>
    <div class="clearfix">
      <div id="b_dv" style="text-align: center">
        {#each pagingSchool as item}
        <input class="custom-btn" type="button" value="{item.no}" on:click={change('school', item.no-1)}>&nbsp;
        {/each}
      </div>
    </div>

  </div>





<!--
<header class="masthead" style="background-image: url('/resources/image/home-bg.jpg')">
    <div class="overlay"></div>
    <div class="container">
      <div class="row">
        <div class="col-lg-8 col-md-10 mx-auto">
          <div class="site-heading">
            <h2>프 로 젝 트</h2>
            <br>
            <span class="subheading">이 때 까 지 한 프 로 젝 트</span>
          </div>
        </div>
      </div>
    </div>
  </header>
  
  <div class="container">
    <div class="row">
      <div class="col-lg-12">
        <h3 style="text-align:center">진행한 프로젝트</h3>
        <hr>


        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://cashnamu.com"><img class="card-img-top" src="../../resources/image/pop_bg.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://cashnamu.com">캐시나무</a>
                </h4>
                <h5>Java, MySQL, jsp</h5>
                <p class="card-text">사용자가 구매한 물품의 일정 비율을 리워드 해 주는 사이트로 토이 프로젝트에서 확장된 케이스 입니다.</p>
              </div>
            </div>
          </div>
        
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/java_web"><img class="card-img-top" src="../../resources/image/springboot.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/java_web">개인 블로그 - Java</a>string
                </h4>
                <h5>Java(Spring Boot), MySQL, mybatis</h5>
                <p class="card-text">현재 보고 있는 이 페이지로 Go언어로 제작한 블로그를 Java, jsp 코드로 변경하고 Bootstrap Template를 사용하여 디자인 하였습니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/GO_WEB"><img class="card-img-top" src="../../resources/image/echo.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/GO_WEB">개인 블로그 - Go</a>
                </h4>
                <h5>Go(Echo), MySQL, Docker</h5>
                <p class="card-text">Go언어를 공부하던 중 웹 개발이 가능한 것을 알고 '웹을 만들면서 공부하면 더 학습이 잘 되지 않을까?' 라는 생각으로 제작하게 되었습니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/PayDay"><img class="card-img-top" src="../../resources/image/spring4.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/PayDay">간편결제 쇼핑몰</a>
                </h4>
                <h5>Java(Spring4), Oracle, mybatis, Apache Tomcat</h5>
                <p class="card-text">카드를 등록하여 간단한 비밀번호 입력으로 서비스나 상품을 구매할 수 있게 하여 사용자에게 편리한 결제 방식을 제공하도록 하였습니다.</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/building_info_competition"><img class="card-img-top" src="../../resources/image/android.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/building_info_competition">건축정보 모바일 서비스 콘텐츠 개발 공모전</a>
                </h4>
                <h5>Java(Android Studio), php, MySQL</h5>
                <p class="card-text">건축 대장 정보나 건축물의 상태 기입을 효율적으로 하기 위한 애플리케이션 입니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>　</div>

      <div class="col-lg-12">
        <h3 style="text-align:center;">학부 수업 프로젝트</h3>
        <hr>


        <div class="row">
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/Makers"><img class="card-img-top" src="../../resources/image/android.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/Makers">여행 애플리케이션</a>
                </h4>
                <h5>Java(Android Studio), Go, MySQL</h5>
                <p class="card-text">여행 동행자 모집 및 주변 여행 정보 획득을 위한 애플리케이션 입니다. 차이점은 동행모집 게시판, 관광지 선호도, 인증 시스템이 있습니다.</p>
              </div>
            </div>
          </div>


          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/rodvkf72/WebMailSystem"><img class="card-img-top" src="../../resources/image/java.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/rodvkf72/WebMailSystem">웹 메일 시스템 유지/보수</a>
                </h4>
                <h5>Java, jsp</h5>
                <p class="card-text">주어진 웹 메일 시스템에 대해 예방, 완전화, 수정, 적응 유지보수를 진행한 프로젝트 입니다.</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/android.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">자동 차량 결제 애플리케이션</a>
                </h4>
                <h5>Java(Android Studio), php, MySQL</h5>
                <p class="card-text">OCR 기술로 번호판 인식을 통해 차량으로 결제를 지원하는 애플리케이션(결제 미구현) 입니다.</p>
              </div>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/ros.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">자율주행 프로그램</a>
                </h4>
                <h5>Python, ROS(Robot Operating System), Gazebo</h5>
                <p class="card-text">주어진 미로에 대한 목적지 도착 및 백트래킹, 주행시험장 신호와 차선을 지키며 목적지에 도착하는 프로그램 입니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="https://github.com/yongjjang/Service-Center-System"><img class="card-img-top" src="../../resources/image/proc.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="https://github.com/yongjjang/Service-Center-System">서비스 센터 프로그램</a>
                </h4>
                <h5>Pro C</h5>
                <p class="card-text">가상의 전자 제품 기업을 상정하고 해당 기업에서 사용하는 서비스 소프트웨어를 개발한다는 내용이며 프로그램 기능보다는 DB의 설계와 구현에 초점을 두었습니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/java.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">인사관리 프로그램</a>
                </h4>
                <h5>Java</h5>
                <p class="card-text">디자인 패턴을 사용하여 제작된 인사관리 프로그램 입니다. 사용된 패턴은 스트래티지 패턴, 이터레이터 패턴, 원격 프록시 패턴, 메멘토 패턴, 커맨드 패턴 입니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/html.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">장르 통합형 웹 사이트</a>
                </h4>
                <h5>html, css, javascript, php</h5>
                <p class="card-text">사용자의 다양한 요구를 만족시키기 위해 하나에 국한되지 않는 다양한 콘텐츠를 제공하고자 하는 목적으로 제작되었습니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/vuforia.jpg" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">AR 구현동화(캡스톤 보고서 형식)</a>
                </h4>
                <h5>Unity Vuforia</h5>
                <p class="card-text">AR로 구현동화를 만들어 양방향성의 콘텐츠로 만들어 교육 효율을 높이자는 생각으로 기획되었습니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/java.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">관광지 주변시설 위치 확인 프로그램</a>
                </h4>
                <h5>Java</h5>
                <p class="card-text">공공 데이터 API를 활용하여 관광지에 대한 핵심정보 뿐만 아니라 주변의 편의시설, 관련정보 등을 하나의 프로그램으로 통합하였습니다.</p>
              </div>
            </div>
          </div>
          
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
              <a href="#"><img class="card-img-top" src="../../resources/image/mfc.png" alt=""></a>
              <div class="card-body">
                <h4 class="card-title">
                  <a href="#">캐릭터 달리기 게임</a>
                </h4>
                <h5>MFC</h5>
                <p class="card-text">쿠키런 이라는 게임을 MFC로 구현하고 몇 가지 추가사항을 더하면 더욱 재밌는 게임을 만들 수 있을 것 같다는 생각으로 제작되었습니다.</p>
              </div>

              <div class="card-footer">
                <small class="text-muted">&#9733; &#9733; &#9733; &#9733; &#9734;</small>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
-->