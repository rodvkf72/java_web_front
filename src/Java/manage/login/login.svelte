<script context="module">
    import { writable } from 'svelte/store';

    const storedToken = sessionStorage.getItem("accessToken");
    export const tokenStorage = writable(storedToken);

    let list = [];

    const loginSubmit = async() => {
        let obj = {};
        
        obj = {
            "id" : document.getElementById("id").value,
            "pw" : document.getElementById("pw").value
        }
        let login = fetch('http://127.0.0.1:8080/Manage/login',
            {
                method: 'POST',
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify(obj)
            }
        ).then((res) => {
            return res.json();
        }).then((json) => {
            list = json;
        })
        await login;
        console.log(list);
        if (list.access == 'empty') {   //엑세스 토큰 확인
            alert("아이디 또는 비밀번호를 확인하세요.");
        } else {
            console.log("test2");
            tokenStorage.subscribe(value => {
                sessionStorage.setItem("accessToken", value = list.access);
                sessionStorage.setItem("refreshToken", value = list.refresh);
                sessionStorage.setItem("id", value = document.getElementById("id").value);
            })
            window.location.href="http://127.0.0.1:4000/Manage/main";
        }
    }
</script>

<br><br><br><br><br><br><br><br><br><br>
<div class="area">
    <form id="form" enctype="multipart/form-data" method="post" on:submit|preventDefault={loginSubmit}>
        <input type="id" name="id" id="id"/>
        <input type="pw" name="pw" id="pw"/>
        
        <input type="submit" value="로그인"/>
    </form>
</div>