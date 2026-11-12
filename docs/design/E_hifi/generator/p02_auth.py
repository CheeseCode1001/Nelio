from lib import *
CUR['page'] = 'auth'; theme('dark')

def authcard(*inner):
    return card(*inner, pad=32, radius=28, gap=18)
google = f'<button type="button" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px; border-radius: 12px; border: 2px solid {T["bd"]}; background: {T["s2"]}; color: {T["tx"]}; font-size: 15px; font-weight: 700; cursor: pointer; font-family: {BF}; min-height: 48px"><span aria-hidden="true" style="width: 20px; height: 20px; border-radius: 50%; background: #FFFFFF; color: #1F1F1F; font-weight: 800; font-size: 13px; display: inline-flex; align-items: center; justify-content: center">G</span>Continue with Google</button>'
orl = f'<div style="display: flex; align-items: center; gap: 12px; color: {T["mu"]}; font-size: 13px"><span style="flex: 1; height: 1px; background: {T["bd"]}"></span>or<span style="flex: 1; height: 1px; background: {T["bd"]}"></span></div>'
side_art = lambda: row(agent('lime','circle',36), agent('grape','blob',36), agent('blue','square',36), gap=8, justify='center')

center_page('SignUp.dc.html','AU-01 Sign up', side_art() + authcard(H('Create your account',30), P('Your AI content team is a minute away.'), google, orl,
    field('Full name','Ada Okafor'), field('Email','ada@adastudio.ng','email'), field('Password','••••••••••','password', hint='At least 10 characters'),
    check('I agree to the Terms of Service and Privacy Policy', True), btn('Create account','primary',full=True, size='lg'),
    P('Already have an account? Log in · Own content? Join as a content owner', size=13)), h=1050)
center_page('LogIn.dc.html','AU-02 Log in', side_art() + authcard(H('Welcome back',30), google, orl, field('Email','ada@adastudio.ng','email'), field('Password','••••••••••','password'),
    banner('red','That email and password don’t match','Check for typos, or reset your password.'), btn('Log in','primary',full=True,size='lg'), P('Forgot password? · Create account', size=13)), h=900)
center_page('VerifyEmail.dc.html','AU-03 Verify email', authcard(bubble('mail','lime',64), H('Check your inbox',30), P('We sent a link to ada@adastudio.ng. It expires in 24 hours.', size=15),
    btn('Open email app','primary',full=True), btn('Resend link (available in 0:42)','secondary',full=True), P('Wrong email? Change it', size=13)), h=700)
center_page('ResetPassword.dc.html','AU-04 Reset password', authcard(bubble('key','grape',64), H('Reset your password',30), P('Enter your email and we’ll send you a reset link if an account exists.'),
    field('Email','ada@adastudio.ng','email'), btn('Send reset link','primary',full=True,size='lg'), banner('teal','Check your email','If that address has an account, a link is on its way.')), h=760)
codebox = ''.join(f'<input aria-label="Digit {i+1}" value="{d}" style="width: 52px; height: 60px; text-align: center; font-size: 24px; font-weight: 800; border-radius: 14px; border: 2px solid {T["lime"] if i==3 else T["bd"]}; background: {T["s2"]}; color: {T["tx"]}; font-family: {HF}">' for i, d in enumerate('482   '))
center_page('MFA.dc.html','AU-05 Two-step verification', authcard(bubble('shield','teal',64), H('Two-step verification',30), P('Enter the 6-digit code from your authenticator app.'),
    f'<div style="display: flex; gap: 8px; justify-content: center">{codebox}</div>', btn('Verify','primary',full=True,size='lg'), P('Lost your device? Use a recovery code', size=13)), h=720)
center_page('AcceptInvite.dc.html','AU-06 Accept invitation', authcard(row(f'<span aria-hidden="true" style="width: 48px; height: 48px; border-radius: 14px; background: {T["orange"]}; color: #0D0D12; font-family: {HF}; font-weight: 800; font-size: 22px; display: inline-flex; align-items: center; justify-content: center">B</span>', col(small('Bola from BrightReach Agency invited you'), h3('Join Acme Foods on Nelio',20), gap=2), gap=12),
    kv([('Your role', chip('Client approver','orange','check')), ('You can','Review and approve content'), ('You can’t','See billing, other clients or account settings')]),
    field('Full name','Chioma Nwosu'), field('Create a password','','password', hint='At least 10 characters'), btn('Accept and continue','primary',full=True,size='lg')), h=900)
center_page('ContentOwnerJoin.dc.html','AU-07 Join as content owner', authcard(chip('Free · no subscription','teal','shield'), H('Join as a content owner',30), P('Let creators clip your videos on your terms. You decide the rules and can revoke any time.'),
    field('Full name','Kemi Adeyemi'), field('Email','kemi@chefkemi.tv','email'), field('Password','','password'), field('Where is your content?','YouTube','select'),
    btn('Create free account','primary',full=True,size='lg'), P('Already use Nelio? Add the Creator Portal to your existing account.', size=13)), h=1000)

# ---------- static onboarding steps ----------
def onb_shell(fname, title, i, inner, h=900):
    top = f'<header style="display: flex; align-items: center; gap: 16px; padding: 20px 32px">{logo(24)}{grow()}<span style="font-size: 13px; color: {T["mu"]}; font-weight: 600">Step {i} of 4</span><a href="#" style="font-size: 14px; font-weight: 700; color: {T["tx"]}">Skip for now</a></header>'
    center_page(fname, title, steps(4, i-1) + inner, h=h, top=top, width=640)
foot = lambda back=True, label='Continue': row(btn('Back','ghost') if back else '', grow(), btn(label,'primary','arrowr',size='lg'), gap=10)
onb_shell('OnbAccountType.dc.html','ON-01 Account type', 1, H('How will you use Nelio?',40) + P('This shapes your workspace. You can change it later.', size=16) +
    col(choice('Creator','I make content for my own channels.', True, 'smile','lime'), choice('Business','I post for my brand with a small team.', False, 'grid','grape'), choice('Agency','I manage content for clients.', False, 'users','blue'), gap=12) + foot(False))
goals = ['Grow followers','Repurpose long videos','Post consistently','Drive sales','Build a community','Manage clients']
gch = row(*[f'<button type="button" aria-pressed="{"true" if g in ("Repurpose long videos","Post consistently") else "false"}" style="padding: 10px 16px; border-radius: 999px; border: 2px solid {T["lime"] if g in ("Repurpose long videos","Post consistently") else T["bd"]}; background: {T["limeT"] if g in ("Repurpose long videos","Post consistently") else T["s1"]}; color: {T["tx"]}; font-size: 14px; font-weight: 600; cursor: pointer; font-family: {BF}; min-height: 44px">{e(g)}</button>' for g in goals], gap=8)
onb_shell('OnbGoals.dc.html','ON-02 Goals & niche', 2, H('What are you going for?',40) + P('Pick as many as you like.', size=16) + gch +
    grid([field('Your niche','Personal finance for students'), field('Main audience','Nigeria','select')], cols=2) + foot())
def conn_row(p, name, state):
    if state == 'connect': r = btn('Connect','secondary','link',size='sm')
    elif state == 'done': r = chip('Connected · @adastudio','teal','check')
    else: r = chip('Coming later','neutral','clock')
    return card(row(plat(p,40), col(h3(name), small({'connect':'Official sign-in. We never see your password.','done':'You can add more accounts later.','later':'We’ll let you know when it’s ready.'}[state]), gap=2), grow(), r, gap=14), pad=16)
onb_shell('OnbConnect.dc.html','ON-03 Connect accounts', 3, H('Connect your accounts',40) + P('Optional. Agents can only post to accounts you connect.', size=16) +
    col(conn_row('ig','Instagram','done'), conn_row('yt','YouTube','connect'), conn_row('tt','TikTok','later'), conn_row('fb','Facebook','later'), gap=10) + foot(), h=1000)
onb_shell('OnbAutomation.dc.html','ON-04 Automation mode', 4, H('How hands-off should agents be?',40) + P('You can change this per agent, any time.', size=16) +
    col(choice('Manual','You start every action. Agents help when asked.', False, 'pen','blue'), choice('Assisted','Agents prepare drafts. Nothing publishes until you approve.', True, 'check','lime','Recommended'),
        choice('Autonomous','Agents publish on their own within limits you set and confirm.', False, 'zap','grape','Needs authorization'), gap=12) +
    banner('grape','Autonomous publishing stays off until you authorize it','When you create an agent, you’ll confirm exactly which account, how often and how much it may spend.') + foot(label='Finish setup'), h=1000)

# ---------- interactive onboarding ----------
ACC = [('creator','Creator','I make content for my own channels.','smile','lime'),('business','Business','I post for my brand with a small team.','grid','grape'),('agency','Agency','I manage content for clients.','users','blue')]
MODES = [('manual','Manual','You start every action. Agents help when asked.','pen','blue',''),('assisted','Assisted','Agents prepare drafts. Nothing publishes until you approve.','check','lime','Recommended'),('auto','Autonomous','Agents publish on their own within limits you set and confirm.','zap','grape','Needs authorization')]
def ichoice(key, title, sub, ic, tone, badge=''):
    bg, fg = TONES()[tone]
    b = f'<span style="padding: 3px 10px; border-radius: 999px; background: {T["grapeT"]}; color: {T["grape"]}; font-size: 12px; font-weight: 700">{e(badge)}</span>' if badge else ''
    return f'''<button type="button" onClick="{{{{ pick_{key} }}}}" aria-pressed="{{{{ pressed_{key} }}}}" style="text-align: left; display: flex; gap: 14px; align-items: center; padding: 18px; border-radius: 20px; border: 2px solid {{{{ bd_{key} }}}}; background: {{{{ bg_{key} }}}}; cursor: pointer; width: 100%; box-sizing: border-box; font-family: {BF}"><span aria-hidden="true" style="width: 48px; height: 48px; border-radius: 14px; background: {bg}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon(ic,24,fg)}</span><span style="flex-grow: 1; display: flex; flex-direction: column; gap: 3px"><span style="display: flex; gap: 8px; align-items: center"><span style="font-size: 17px; font-weight: 700; color: {T["tx"]}">{e(title)}</span>{b}</span><span style="font-size: 14px; color: {T["mu"]}">{e(sub)}</span></span><span aria-hidden="true" style="width: 26px; height: 26px; border-radius: 50%; border: 2px solid {{{{ bd_{key} }}}}; background: {{{{ dot_{key} }}}}; flex: none; box-sizing: border-box"></span></button>'''
def nav_(back=True, label='Continue'):
    b = f'<button type="button" onClick="{{{{ back }}}}" style="padding: 12px 18px; border-radius: 12px; border: 2px solid transparent; background: transparent; color: {T["tx"]}; font-weight: 700; font-size: 15px; cursor: pointer; min-height: 48px; font-family: {BF}">Back</button>' if back else ''
    return f'<div style="display: flex; align-items: center; gap: 10px">{b}<div style="flex-grow: 1"></div><button type="button" onClick="{{{{ next }}}}" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border-radius: 14px; border: none; background: {T["lime"]}; color: {T["onlime"]}; font-weight: 800; font-size: 16px; cursor: pointer; min-height: 52px; font-family: {BF}">{e(label)}{icon("arrowr",18)}</button></div>'
prog = ''.join(f'<span style="flex: 1; height: 6px; border-radius: 999px; background: {{{{ seg{k} }}}}"></span>' for k in range(4))
HEAD = lambda t, s: H(t, 44) + P(s, size=17)

s0 = f'''<sc-if value="{{{{ s0 }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 22px; padding-top: 40px">
{row(agent('lime','circle',72), agent('grape','blob',88), agent('blue','square',72), gap=14, align='flex-end', justify='center')}
<h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: 60px; letter-spacing: -0.04em; line-height: 1">Hey Ada, meet your agents.</h1>
{P("Four quick questions and your studio is ready. Skip anything you like.", size=18)}
<button type="button" onClick="{{{{ next }}}}" style="display: inline-flex; align-items: center; gap: 10px; padding: 16px 28px; border-radius: 16px; border: none; background: {T["lime"]}; color: {T["onlime"]}; font-weight: 800; font-size: 18px; cursor: pointer; font-family: {BF}; min-height: 56px">Let’s go{icon("arrowr",20)}</button>
{small("Takes about a minute")}</div></sc-if>'''
s1 = f'<sc-if value="{{{{ s1 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 18px">{HEAD("How will you use Nelio?","This shapes your workspace. You can change it later.")}' + ''.join(ichoice(k,t,s,i,tn) for k,t,s,i,tn in ACC) + nav_() + '</div></sc-if>'
gl = f'''<div style="display: flex; flex-wrap: wrap; gap: 10px"><sc-for list="{{{{ goals }}}}" as="g" hint-placeholder-count="6"><button type="button" onClick="{{{{ g.toggle }}}}" aria-pressed="{{{{ g.pressed }}}}" style="padding: 12px 18px; border-radius: 999px; border: 2px solid {{{{ g.bd }}}}; background: {{{{ g.bg }}}}; color: {T["tx"]}; font-size: 15px; font-weight: 600; cursor: pointer; font-family: {BF}; min-height: 46px">{{{{ g.label }}}}</button></sc-for></div>'''
s2 = f'<sc-if value="{{{{ s2 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 18px">{HEAD("What are you going for?","Pick as many as you like.")}{gl}' + grid([field('Your niche','','input','e.g. personal finance for students'), field('Main audience','Nigeria','select')], cols=2) + nav_() + '</div></sc-if>'
def iconn(key, p, name):
    return f'''<div style="display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 20px; border: 1px solid {T["bd"]}; background: {T["s1"]}">{plat(p,44)}<div style="flex-grow: 1"><div style="font-size: 16px; font-weight: 700">{name}</div><div style="font-size: 13px; color: {T["mu"]}">Official sign-in. We never see your password.</div></div><sc-if value="{{{{ c_{key} }}}}" hint-placeholder-val="{{{{ false }}}}"><span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: {T["tealT"]}; color: {T["teal"]}; font-size: 13px; font-weight: 700">{icon("check",14,T["teal"])}Connected</span></sc-if><sc-if value="{{{{ nc_{key} }}}}" hint-placeholder-val="{{{{ true }}}}"><button type="button" onClick="{{{{ conn_{key} }}}}" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 12px; border: 2px solid {T["bd"]}; background: {T["s2"]}; color: {T["tx"]}; font-weight: 700; font-size: 14px; cursor: pointer; min-height: 44px; font-family: {BF}">{icon("link",16)}Connect</button></sc-if></div>'''
later = lambda p, n: f'<div style="display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 20px; border: 1px dashed {T["bd"]}">{plat(p,44)}<div style="flex-grow: 1; font-size: 16px; font-weight: 700">{n}</div>{chip("Coming later","neutral","clock")}</div>'
s3 = f'<sc-if value="{{{{ s3 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 14px">{HEAD("Connect your accounts","Optional. Agents can only post to accounts you connect.")}{iconn("ig","ig","Instagram")}{iconn("yt","yt","YouTube")}{later("tt","TikTok")}{later("fb","Facebook")}' + nav_() + '</div></sc-if>'
autonote = f'<sc-if value="{{{{ isAuto }}}}" hint-placeholder-val="{{{{ false }}}}">{banner("grape","You’ll set the limits first","Autonomous publishing stays off until you confirm the account, how often and the budget for each agent.")}</sc-if>'
s4 = f'<sc-if value="{{{{ s4 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 14px">{HEAD("How hands-off should agents be?","You can change this per agent, any time.")}' + ''.join(ichoice(k,t,s,i,tn,b) for k,t,s,i,tn,b in MODES) + autonote + nav_(label='Finish setup') + '</div></sc-if>'
todo = lst([('Add your brand kit','Colours, fonts and caption style', bubble('palette','orange',36), chip('2 min','neutral')),('Upload your first video','We’ll find the best moments', bubble('upload','lime',36), chip('Start here','lime')),('Create your first agent','Or ask Nelio AI to plan one', bubble('bot','grape',36), ''),('Choose notifications','Approvals, renders, spending', bubble('bell','blue',36), '')])
s5 = f'''<sc-if value="{{{{ s5 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 20px"><div style="display: flex; align-items: center; gap: 16px">{agent("lime","circle",64)}<div><h1 style="margin: 0; font-family: {HF}; font-weight: 800; font-size: 48px; letter-spacing: -0.04em">You’re in.</h1>{P("Your studio is ready. Here’s what to do next. It stays on your dashboard until it’s done.", size=16)}</div></div>{todo}<a href="CommandCenter.dc.html" style="display: inline-flex; align-self: flex-start; align-items: center; gap: 10px; padding: 16px 26px; border-radius: 16px; background: {T["lime"]}; color: {T["onlime"]}; font-weight: 800; font-size: 17px; text-decoration: none">Go to Command Center{icon("arrowr",18)}</a></div></sc-if>'''
top = f'''<header style="display: flex; align-items: center; gap: 16px; padding: 20px 32px">{logo(24)}<div style="flex-grow: 1"></div><sc-if value="{{{{ showSkip }}}}" hint-placeholder-val="{{{{ true }}}}"><button type="button" onClick="{{{{ skip }}}}" style="border: none; background: transparent; color: {T["tx"]}; font-weight: 700; font-size: 15px; cursor: pointer; font-family: {BF}; min-height: 44px">Skip for now</button></sc-if></header>'''
body = top + f'''<main style="flex-grow: 1; display: flex; justify-content: center; padding: 24px 20px 64px"><div style="width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 28px"><sc-if value="{{{{ showProg }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 8px"><div style="display: flex; gap: 6px">{prog}</div><span style="font-size: 13px; color: {T["mu"]}; font-weight: 600">Step {{{{ stepNo }}}} of 4</span></div></sc-if>{s0}{s1}{s2}{s3}{s4}{s5}</div></main>'''
LIME, LT, BD, S1 = T['lime'], T['limeT'], T['bd'], T['s1']
script = '''class Component extends DCLogic {
  constructor(props) { super(props); this.state = { step: 0, acct: 'creator', mode: 'assisted', goals: ['Repurpose long videos'], conn: {} }; }
  renderVals() {
    const s = this.state, st = s.step;
    const sel = (on) => ({ bd: on ? '%LIME%' : '%BD%', bg: on ? '%LT%' : '%S1%', dot: on ? '%LIME%' : 'transparent', pressed: on ? 'true' : 'false' });
    const v = { s0: st === 0, s1: st === 1, s2: st === 2, s3: st === 3, s4: st === 4, s5: st === 5,
      showSkip: st > 0 && st < 5, showProg: st > 0 && st < 5, stepNo: st, isAuto: s.mode === 'auto',
      next: () => this.setState({ step: Math.min(5, st + 1) }), back: () => this.setState({ step: Math.max(0, st - 1) }), skip: () => this.setState({ step: Math.min(5, st + 1) }) };
    for (let k = 0; k < 4; k++) v['seg' + k] = k < st ? '%LIME%' : '#292936';
    ['creator','business','agency'].forEach((k) => { const x = sel(s.acct === k); v['bd_' + k] = x.bd; v['bg_' + k] = x.bg; v['dot_' + k] = x.dot; v['pressed_' + k] = x.pressed; v['pick_' + k] = () => this.setState({ acct: k }); });
    ['manual','assisted','auto'].forEach((k) => { const x = sel(s.mode === k); v['bd_' + k] = x.bd; v['bg_' + k] = x.bg; v['dot_' + k] = x.dot; v['pressed_' + k] = x.pressed; v['pick_' + k] = () => this.setState({ mode: k }); });
    v.goals = ['Grow followers','Repurpose long videos','Post consistently','Drive sales','Build a community','Manage clients'].map((g) => { const on = s.goals.indexOf(g) >= 0; return { label: g, bd: on ? '%LIME%' : '%BD%', bg: on ? '%LT%' : '%S1%', pressed: on ? 'true' : 'false', toggle: () => this.setState({ goals: on ? s.goals.filter((x) => x !== g) : s.goals.concat([g]) }) }; });
    ['ig','yt'].forEach((k) => { v['c_' + k] = !!s.conn[k]; v['nc_' + k] = !s.conn[k]; v['conn_' + k] = () => this.setState({ conn: Object.assign({}, s.conn, { [k]: true }) }); });
    return v;
  }
}'''.replace('%LIME%', LIME).replace('%BD%', BD).replace('%LT%', LT).replace('%S1%', S1)
write('Onboarding.dc.html', doc('Onboarding flow (interactive)', body, 1440, 1000, script=script))
REG['Onboarding.dc.html']['interactive'] = True
