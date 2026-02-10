document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('theme-switch').addEventListener('change', (a)=>{
        if(a.target.checked){
            console.log('Világos mód');

            // Sima body
            document.documentElement.style.backgroundColor = '#f4f4f8';
            document.body.style.backgroundColor = '#f4f4f8';
            document.body.style.color = '#1a1a1a';


            // Felső sor
            document.getElementById('upper-row').style.backgroundColor = 'rgba(104, 231, 193, 0.35)';

            document.getElementsByClassName('button-sample').style.backgroundColor = '#7fe3d22f;'

            document.getElementById('shifting-text1').id = ('shifting-textForLightTheme1')

            document.getElementById('shifting-text2').id = ('shifting-textForLightTheme2')


            document.getElementById('side-nav').style.backgroundColor = '#f0f0f5';
            document.getElementById('stats').style.backgroundColor = '#ffffff';
            document.getElementById('ranglist').style.backgroundColor = '#ffffff';
            document.getElementById('calendar').style.backgroundColor = '#ffffff';
            document.getElementById('muscle-tracker').style.backgroundColor = '#ffffff';

            document.querySelector('.offcanvas').style.backgroundColor = '#f0f0f5';

            document.querySelector('.nav-link').style.color = '#1a1a1a';
            document.querySelector('.nav-item').style.borderColor = '#7c3aed';

            document.querySelector('.button-sample').style.backgroundColor = '#e4ddf5';
            document.querySelector('.button-sample').style.color = '#2c203b';

            document.getElementById('main-page-title').style.color = '#1a1a1a';
            document.getElementById('stat-title').style.color = '#1a1a1a';

            document.getElementById('profile-bubble').style.backgroundColor =
                'rgba(0,0,0,0.05)';

            
        }
        else{
            console.log('Sötét mód')
            document.documentElement.style.backgroundColor = '#0b0b10';
            document.body.style.backgroundColor = '#0b0b10';
            document.body.style.color = '#f5f5ff';

            document.getElementById('upper-row').style.backgroundColor = '#0f0f17';
            document.getElementById('side-nav').style.backgroundColor = '#0f0f17';
            document.getElementById('stats').style.backgroundColor = '#0f0f17';
            document.getElementById('ranglist').style.backgroundColor = '#0f0f17';
            document.getElementById('calendar').style.backgroundColor = '#0f0f17';
            document.getElementById('muscle-tracker').style.backgroundColor = '#0f0f17';

            document.querySelector('.offcanvas').style.backgroundColor = '#0f0f17';

            document.querySelector('.nav-link').style.color = '#ffffff';
            document.querySelector('.nav-item').style.borderColor = '#612eb9';

            document.querySelector('.button-sample').style.backgroundColor = '#2c203b';
            document.querySelector('.button-sample').style.color = '#ffffff';

            document.getElementById('main-page-title').style.color = '#ffffff';
            document.getElementById('stat-title').style.color = '#ffffff';

            document.getElementById('profile-bubble').style.backgroundColor =
                'rgba(255,255,255,0.144)';


        }
    })
})