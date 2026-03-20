const categories=["Communication","Vision","Positioning","Technical Decisions","Control of Contact","Game Management","Advantage"];

const container=document.getElementById("categories");

categories.forEach(cat=>{
    container.innerHTML+=`
        <div class='category-box'>
            <label class='cat-title'>${cat}</label>

            <div class='checkbox-row'>
                <div>
                    <strong>1st Half</strong><br>
                    <input type='checkbox' id='${cat}-1st' class='autosave'>
                </div>
                <div>
                    <strong>2nd Half</strong><br>
                    <input type='checkbox' id='${cat}-2nd' class='autosave'>
                </div>
            </div>

            <label>Notes – 1st Half</label>
            <textarea id='${cat}-notes1' class='autosave'></textarea>

            <label>Notes – 2nd Half</label>
            <textarea id='${cat}-notes2' class='autosave'></textarea>
        </div>
    `;
});
