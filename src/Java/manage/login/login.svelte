<script context="module">
    import { writable } from 'svelte/store';

    const storedToken = localStorage.getItem("tokenStorage");
    export const tokenStorage = writable(storedToken);

    let list = [];

    const loginSubmit = async() => {
        let obj = {};
        
        obj = {
            "id" : document.getElementById("id").value,
            "pw" : document.getElementById("pw").value
        }
        let login = fetch('http://localhost:8080/Manage/login',
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
        tokenStorage.subscribe(value => {
            localStorage.setItem("tokenStorage", value = list.result);
        })
        console.log(list.result);
        tokenStorage.set(list.result);
        console.log(tokenStorage);
    }
</script>

<br><br><br><br><br><br><br><br><br><br>
<div class="area">
    <form id="form" enctype="multipart/form-data" method="post" action="http://localhost:8080/login" on:submit|preventDefault={loginSubmit}>
        <input type="id" name="id" id="id"/>
        <input type="pw" name="pw" id="pw"/>
        
        <input type="submit" value="로그인"/>
    </form>
</div>