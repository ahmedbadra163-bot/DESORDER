// ── CONFIG ──────────────────────────────────────────────
const TO_EMAIL = "ahmedbadra163@gmail.com";
// ────────────────────────────────────────────────────────

const answers = { age:"", gender:"", location:"", frequency:"", budget:"", buyWhere:[], criteria:{}, discover:[], message:"" };
let currentSection = 0;

// Build rating dots
document.querySelectorAll('.rdots').forEach(container => {
  const criterion = container.dataset.c;
  for(let n=1;n<=5;n++){
    const btn = document.createElement('button');
    btn.className = 'dot';
    btn.textContent = n;
    btn.onclick = () => {
      answers.criteria[criterion] = n;
      container.querySelectorAll('.dot').forEach((d,i)=>d.classList.toggle('act',i+1===n));
    };
    container.appendChild(btn);
  }
});

// Radio buttons
document.querySelectorAll('.obtn:not(.cbx)').forEach(btn => {
  btn.onclick = () => {
    const q = btn.dataset.q;
    document.querySelectorAll(`[data-q="${q}"]:not(.cbx)`).forEach(b=>{
      b.classList.remove('sel');
      b.querySelector('.icon').textContent='○';
    });
    btn.classList.add('sel');
    btn.querySelector('.icon').textContent='▶';
    answers[q] = btn.dataset.v;
  };
});

// Checkboxes
document.querySelectorAll('.cbx').forEach(btn => {
  btn.onclick = () => {
    const q = btn.dataset.q;
    const v = btn.dataset.v;
    const arr = answers[q];
    if(arr.includes(v)){
      answers[q] = arr.filter(x=>x!==v);
      btn.classList.remove('sel');
      btn.querySelector('.icon').textContent='□';
    } else {
      answers[q].push(v);
      btn.classList.add('sel');
      btn.querySelector('.icon').textContent='✕';
    }
  };
});

function goTo(n){
  answers.location = document.getElementById('location').value;
  answers.message  = document.getElementById('message').value;
  document.getElementById('sec'+currentSection).classList.add('hidden');
  currentSection = n;
  const sec = document.getElementById('sec'+n);
  sec.classList.remove('hidden');
  sec.classList.add('fi');
  updateProgress();
  window.scrollTo(0,0);
}

function updateProgress(){
  document.getElementById('pfill').style.width = ((currentSection+1)/3*100)+'%';
}

function formatAnswers(){
  return [
    `1. How old are you?\n  ➜ ${answers.age||'No answer'}`,
    `2. Gender\n  ➜ ${answers.gender||'No answer'}`,
    `3. Where do you live?\n  ➜ ${answers.location||'No answer'}`,
    `4. How often do you buy streetwear?\n  ➜ ${answers.frequency||'No answer'}`,
    `5. Average budget per item?\n  ➜ ${answers.budget||'No answer'}`,
    `6. Where do you buy clothes?\n  ➜ ${answers.buyWhere.length?answers.buyWhere.join(', '):'No answer'}`,
    `7. Criteria ratings:\n${Object.entries(answers.criteria).map(([k,v])=>`  • ${k}: ${v}/5`).join('\n')||'  No answer'}`,
    `8. How did you discover DESORDER?\n  ➜ ${answers.discover.length?answers.discover.join(', '):'No answer'}`,
    `9. Message for DESORDER:\n  ➜ ${answers.message||'No answer'}`,
  ].join('\n\n');
}

async function submitForm(){
  answers.location = document.getElementById('location').value;
  answers.message  = document.getElementById('message').value;

  document.getElementById('sec2').classList.add('hidden');
  document.getElementById('thankYou').classList.remove('hidden');
  document.getElementById('pfill').style.width='100%';
  window.scrollTo(0,0);

  const formatted = formatAnswers();
  let aiSummary = '';

  // AI Summary
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key': 'YOUR_ANTHROPIC_API_KEY', // Need an API key if you want this to work properly
        'anthropic-version': '2023-06-01'
      },
      body:JSON.stringify({
        model:'claude-3-sonnet-20240229',
        max_tokens:1000,
        messages:[{role:'user',content:`You are a brand analyst for DESORDER streetwear. A customer filled this questionnaire:\n\n${formatted}\n\nWrite a punchy 3-sentence customer profile for the DESORDER team (raw, direct tone). Then give 2 product recommendations based on their answers.`}]
      })
    });
    const data = await res.json();
    aiSummary = data.content?.map(c=>c.text||'').join('')||'No summary generated.';
  } catch(e){ aiSummary='AI summary unavailable.'; }

  // Send Email via FormSubmit (No setup required)
  let emailMsg = '';
  try {
    const response = await fetch(`https://formsubmit.co/ajax/${TO_EMAIL}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: "🔴 DESORDER — New Response",
        Answers: formatted,
        AI_Summary: aiSummary,
        Date: new Date().toLocaleString('fr-MA')
      })
    });
    
    if (response.ok) {
        emailMsg = '✓ Email sent successfully. (Note: The very first time, you must check your email to activate FormSubmit!)';
    } else {
        emailMsg = '⚠ Error sending email. Please try again.';
    }
  } catch(e){
    emailMsg = '⚠ Error sending email: ' + e.message;
  }

  document.getElementById('loadingMsg').classList.add('hidden');
  document.getElementById('aiSummary').textContent = aiSummary;
  const es = document.getElementById('emailStatus');
  es.textContent = emailMsg;
  if(emailMsg.includes('⚠')) es.classList.add('warn');
  document.getElementById('resultArea').classList.remove('hidden');
}

updateProgress();
