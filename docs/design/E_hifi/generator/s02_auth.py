from frame import *

google = lambda: f'<button type="button" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 12px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; font-size: 15px; font-weight: 700; cursor: pointer; font-family: {BF}; min-height: 50px"><span aria-hidden="true" style="width: 22px; height: 22px; border-radius: 50%; background: #FFFFFF; border: 2px solid {OL}; color: {OL}; font-weight: 800; font-size: 12px; display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box">G</span>Continue with Google</button>'
orl = lambda: f'<div style="display: flex; align-items: center; gap: 12px; color: {T["mu"]}; font-size: 13px"><span style="flex: 1; height: 1px; background: {T["bd"]}"></span>or<span style="flex: 1; height: 1px; background: {T["bd"]}"></span></div>'
def side(bg, il, title, stickers=()):
    st = ''.join(f'<div style="position: absolute; {pos}">{sticker(t, c, r, None, 14, True, .4+.1*i)}</div>' for i, (t, c, r, pos) in enumerate(stickers))
    return (bg, f'{lime_blob(520, "rgba(255,255,255,0.25)", "right: -120px; top: -120px")}<div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 22px; text-align: center">{art(il, 420)}{big(title, 40, OL)}</div>{st}')
SIDE_IN = lambda: side('#B6F24A', 'welcome', 'Your AI content team is a minute away.', [('No card needed','#FFFFFF',-5,'top: 60px; left: 60px'),('Free forever plan','#FFD43B',4,'bottom: 70px; right: 60px')])
H2 = lambda t, s=None: H(t, 34) + (P(s, size=15) if s else '')

@screen('AU-01','Sign up','SignUp','auth',('filled',('error','Validation errors'),('taken','Email already used'),('submitting','Submitting')))
def _(st, f, t):
    em = field('Email','ada@','email', err='Enter a full email address') if st == 'error' else field('Email','ada@adastudio.ng','email')
    pw = field('Password','••••','password', err='At least 10 characters') if st == 'error' else field('Password','••••••••••','password', hint='At least 10 characters')
    top = banner('warn','That email already has an account','Log in instead, or reset your password.','Log in', href='LogIn.dc.html') if st == 'taken' else ''
    b = f'<button type="button" disabled style="display: flex; justify-content: center; align-items: center; gap: 10px; width: 100%; padding: 14px; border-radius: 999px; border: none; background: {T["acc"]}; color: #FFFFFF; font-weight: 700; font-size: 16px; min-height: 52px; opacity: .8; font-family: {BF}"><span style="display: inline-flex; {A("spin")}">{icon("refresh",18,"#FFFFFF")}</span>Creating your account…</button>' if st == 'submitting' else btn('Create account','primary',None,'Onboarding.dc.html','lg',True)
    inner = H2('Create your account', 'Start free. Upgrade when your agents earn it.') + top + google() + orl() + field('Full name','Ada Okafor') + em + pw + check('I agree to the Terms of Service and Privacy Policy', True) + b + P('Already have an account? Log in · Own content? Join as a content owner', size=13)
    center_page(f, t, inner, h=1000, side=SIDE_IN())

@screen('AU-02','Log in','LogIn','auth',('filled',('error','Wrong password'),('locked','Too many attempts')))
def _(st, f, t):
    msg = {'error': banner('err','That email and password don’t match','Check for typos, or reset your password.'), 'locked': banner('err','Too many tries','Wait 15 minutes, or reset your password now.','Reset', href='ResetPassword.dc.html')}.get(st, '')
    inner = H2('Welcome back', None) + google() + orl() + field('Email','ada@adastudio.ng','email') + field('Password','••••••••••','password') + msg + btn('Log in','primary',None,'CommandCenter.dc.html','lg',True) + P('Forgot password? · Create account', size=13)
    center_page(f, t, inner, h=900, side=side('#59D8FF', 'agents', 'Your agents kept working while you were away.', [('3 drafts ready','#FFD43B',-4,'top: 70px; left: 70px')]))

@screen('AU-03','Verify email','VerifyEmail','auth',('filled',('resent','Resent'),('expired','Link expired')))
def _(st, f, t):
    ex = st == 'expired'
    inner = f'<div style="display: flex; justify-content: center">{art("notifications" if not ex else "denied", 260)}</div>' + H2('Check your inbox' if not ex else 'That link expired', 'We sent a link to ada@adastudio.ng. It expires in 24 hours.' if not ex else 'No worries, we’ll send a fresh one.') + \
        (banner('ok','Sent again','Give it a minute and check spam too.') if st == 'resent' else '') + btn('Open email app' if not ex else 'Send a new link', 'primary', None, '#', 'lg', True) + (btn('Resend link · available in 0:42','secondary',full=True) if not ex else '')
    center_page(f, t, inner, h=900)

@screen('AU-04','Reset password','ResetPassword','auth',('filled',('sent','Link sent'),('newpass','Set new password'),('expired','Link expired')))
def _(st, f, t):
    if st == 'newpass': inner = H2('Choose a new password') + field('New password','••••••••••','password', hint='At least 10 characters') + field('Confirm password','••••••••••','password') + btn('Save and log in','primary',None,'CommandCenter.dc.html','lg',True)
    elif st == 'expired': inner = f'<div style="display: flex; justify-content: center">{art("denied",240)}</div>' + H2('This reset link expired','Links last 1 hour. Request a new one below.') + field('Email','ada@adastudio.ng','email') + btn('Send a new link','primary',full=True,size='lg')
    else: inner = f'<div style="display: flex; justify-content: center">{art("lost",240)}</div>' + H2('Forgot your password?','Enter your email and we’ll send a reset link if an account exists.') + field('Email','ada@adastudio.ng','email') + btn('Send reset link','primary',full=True,size='lg') + (banner('ok','Check your email','If that address has an account, a link is on its way.') if st == 'sent' else '')
    center_page(f, t, inner, h=900)

@screen('AU-05','Two-step verification','MFA','auth',('filled',('setup','Setup'),('wrong','Wrong code')))
def _(st, f, t):
    if st == 'setup':
        qr = f'<div role="img" aria-label="QR code" style="width: 180px; height: 180px; border-radius: 20px; border: 2px solid {OL}; background: #FFFFFF; display: grid; grid-template-columns: repeat(9, 1fr); padding: 12px; gap: 2px; box-sizing: border-box; margin: 0 auto">' + ''.join(f'<span style="background: {OL if (i*7+i//9)%3==0 else "#FFFFFF"}; border-radius: 2px"></span>' for i in range(81)) + '</div>'
        inner = H2('Set up two-step verification','Scan with your authenticator app, then enter the code.') + qr + card(h3('Recovery codes'), P('Save these somewhere safe. Each works once.'), f'<div style="display: grid; grid-template-columns: repeat(2,1fr); gap: 6px; font-family: ui-monospace, monospace; font-size: 14px">' + ''.join(f'<span>{c}</span>' for c in ['8F2K-19QD','7MZP-A41C','Q0TX-55LB','H3RN-2W8E']) + '</div>', btn('Download codes','secondary','download'), pad=18) + btn('Continue','primary',full=True,size='lg')
    else:
        boxes = ''.join(f'<input aria-label="Digit {i+1}" value="{d}" style="width: 54px; height: 64px; text-align: center; font-size: 26px; font-weight: 800; border-radius: 16px; border: 2px solid {T["errTx"] if st=="wrong" else (T["acc"] if i==3 else T["bd"])}; background: {T["s1"]}; color: {T["tx"]}; font-family: {HF}">' for i, d in enumerate('482917' if st == 'wrong' else '482   '))
        inner = f'<div style="display: flex; justify-content: center">{art("verify",220)}</div>' + H2('Enter your 6-digit code','From your authenticator app.') + f'<div style="display: flex; gap: 8px; justify-content: center">{boxes}</div>' + (banner('err','That code didn’t work','Codes change every 30 seconds. Try the newest one.') if st == 'wrong' else '') + btn('Verify','primary',None,'CommandCenter.dc.html','lg',True) + P('Lost your device? Use a recovery code', size=13)
    center_page(f, t, inner, h=1000)

@screen('AU-06','Accept invitation','AcceptInvite','auth',('filled',('expired','Invite expired'),('accepted','Already accepted'),('mismatch','Signed in as someone else')))
def _(st, f, t):
    head = row(f'<span aria-hidden="true" style="width: 52px; height: 52px; border-radius: 16px; background: {T["orange"]}; border: 2px solid {OL}; box-sizing: border-box; color: {OL}; font-family: {HF}; font-weight: 800; font-size: 22px; display: inline-flex; align-items: center; justify-content: center">B</span>', col(small('Bola from BrightReach Agency invited you'), h3('Join Acme Foods on Nelio',20), gap=2), gap=12)
    if st == 'expired': body = banner('warn','This invite expired','Invites last 7 days. Ask Bola to send a new one.') + btn('Email Bola','secondary','mail',full=True)
    elif st == 'accepted': body = banner('ok','You’ve already joined Acme Foods','Log in to continue.') + btn('Log in','primary',None,'LogIn.dc.html','lg',True)
    elif st == 'mismatch': body = banner('warn','This invite is for chioma@acmefoods.ng','You’re signed in as ada@adastudio.ng.') + btn('Switch account','primary',full=True,size='lg') + btn('Cancel','ghost',full=True)
    else: body = kv([('Your role', chip('Client approver','warn','check')), ('You can','Review and approve content'), ('You can’t','See billing, other clients or settings')]) + field('Full name','Chioma Nwosu') + field('Create a password','','password', hint='At least 10 characters') + btn('Accept and continue','primary',None,'ClientPortal.dc.html','lg',True)
    center_page(f, t, head + body, h=950, side=side('#FF7A2F', 'team', 'BrightReach wants your OK on their posts.', [('Approve from your phone','#FFFFFF',-4,'top: 70px; left: 60px')]))

@screen('AU-07','Join as content owner','ContentOwnerJoin','auth',('filled',))
def _(st, f, t):
    inner = sticker('Free · no subscription','#59D8FF',-3,'shield',13,False) + H2('Join as a content owner','Let creators clip your videos on your terms. Revoke any time.') + field('Full name','Kemi Adeyemi') + field('Email','kemi@chefkemi.tv','email') + field('Password','','password') + field('Where is your content?','YouTube','select') + btn('Create free account','primary',None,'CreatorOverview.dc.html','lg',True) + P('Already use Nelio? Add the Creator Portal to your existing account.', size=13)
    center_page(f, t, inner, h=1000, side=side('#FF4FB8', 'licenses', 'Your content. Your rules.', [('Revoke anytime','#FFD43B',5,'top: 70px; right: 70px')]))

# ---------- onboarding static ----------
def onb(f, t, i, inner, h=980, il=None):
    top = f'<header style="display: flex; align-items: center; gap: 16px; padding: 20px 32px">{logo(24)}{grow()}<span style="font-size: 13px; color: {T["mu"]}; font-weight: 700">Step {i} of 4</span>{btn("Skip for now","ghost",None,"CommandCenter-Empty.dc.html")}</header>'
    sd = ('#F1F3F9', f'<div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 18px">{art(il, 400)}</div>') if il else None
    center_page(f, t, steps(4, i-1) + inner, h=h, top=top, width=600, side=sd)
foot = lambda back=True, label='Continue', href='#': row(btn('Back','ghost') if back else '', grow(), btn(label,'cta',None,href,'lg',arrow=True), gap=10)

@screen('ON-01','Account type','OnbAccountType','auth',('filled',('selected','Agency selected')))
def _(st, f, t):
    sel = 2 if st == 'selected' else 0
    onb(f, t, 1, H('How will you use Nelio?',40) + P('This shapes your workspace. You can change it later.', size=16) + col(*[choice(a, b, k == sel, ic, tn) for k, (a, b, ic, tn) in enumerate([('Creator','I make content for my own channels.','smile','lime'),('Business','I post for my brand with a small team.','grid','blue'),('Agency','I manage content for clients.','users','ai')])], gap=12) + foot(False, href='OnbGoals.dc.html'), il='welcome')
@screen('ON-02','Goals & niche','OnbGoals','auth',('filled',))
def _(st, f, t):
    goals = ['Grow followers','Repurpose long videos','Post consistently','Drive sales','Build a community','Manage clients']
    on = ('Repurpose long videos','Post consistently')
    g = row(*[f'<button type="button" aria-pressed="{"true" if x in on else "false"}" style="padding: 12px 18px; border-radius: 999px; border: 2px solid {T["acc"] if x in on else T["bd"]}; background: {T["accT"] if x in on else T["s1"]}; color: {T["accTx"] if x in on else T["tx"]}; font-size: 15px; font-weight: 700; cursor: pointer; font-family: {BF}; min-height: 46px">{e(x)}</button>' for x in goals], gap=10)
    onb(f, t, 2, H('What are you going for?',40) + P('Pick as many as you like.', size=16) + g + grid([field('Your niche','Personal finance for students'), field('Main audience','Nigeria','select')], cols=2) + foot(href='OnbConnect.dc.html'), il='strategist')
def conn_row(p, n, state):
    r = {'connect': btn('Connect','secondary','link',size='sm'), 'done': chip('Connected · @adastudio','ok','check'), 'later': chip('Coming later','neutral','clock'), 'limit': chip('Plan limit: 1 account','warn','lock')}[state]
    return card(row(plat(p,44), col(h3(n), small({'connect':'Official sign-in. We never see your password.','done':'You can add more later.','later':'We’ll tell you when it’s ready.','limit':'Upgrade to connect more.'}[state]), gap=2), grow(), r, gap=14), pad=16)
@screen('ON-03','Connect accounts','OnbConnect','auth',('filled',('connected','One connected'),('limit','Plan limit')))
def _(st, f, t):
    ig = 'done' if st in ('connected','limit') else 'connect'; yt = 'limit' if st == 'limit' else 'connect'
    onb(f, t, 3, H('Connect your accounts',40) + P('Optional. Agents can only post to accounts you connect.', size=16) + col(conn_row('ig','Instagram',ig), conn_row('yt','YouTube',yt), conn_row('tt','TikTok','later'), conn_row('fb','Facebook','later'), gap=10) + foot(href='OnbAutomation.dc.html'), h=1050, il='connect')
@screen('ON-04','Automation mode','OnbAutomation','auth',('filled',('autonomous','Autonomous picked'),('free','Free plan (locked)')))
def _(st, f, t):
    a = st == 'autonomous'; fr = st == 'free'
    ch = col(choice('Manual','You start every action. Agents help when asked.', False, 'pen','blue'), choice('Assisted','Agents prepare drafts. Nothing publishes until you approve.', not a, 'check','lime','Recommended'),
             choice('Autonomous','Agents publish on their own within limits you set and confirm.', a, 'zap','ai', 'Paid plans' if fr else 'Needs authorization', locked=fr), gap=12)
    note = banner('ai','You’ll set the limits first','Autonomous publishing stays off until you confirm the account, how often and the budget for each agent.') if a else (banner('blue','Autonomous publishing is on paid plans','Start a 3-day trial to try it, no card needed.','Start trial') if fr else '')
    onb(f, t, 4, H('How hands-off should agents be?',40) + P('You can change this per agent, any time.', size=16) + ch + note + foot(label='Finish setup', href='OnbDone.dc.html'), h=1080, il='agents')
@screen('ON-05','All set','OnbDone','auth',('filled',))
def _(st, f, t):
    todo = lst([('Upload your first video','We’ll find the best moments', bubble('upload','lime',40), chip('Start here','blue')),('Add your brand kit','Colours, fonts and caption style', bubble('palette','warn',40), chip('2 min','neutral')),('Create your first agent','Or ask Nelio AI to plan one', bubble('bot','ai',40), ''),('Choose notifications','Approvals, renders, spending', bubble('bell','blue',40), '')])
    inner = f'<div style="display: flex; justify-content: center; position: relative">{art("success", 300)}<div style="position: absolute; top: 10px; right: 30px">{sticker("You’re in!","#FFD43B",6,"star",16)}</div></div>' + big('Your studio is ready.', 48) + P('Here’s what to do next. It stays on your dashboard until it’s done.', size=16) + todo + btn('Go to Command Center','cta',None,'CommandCenter-Empty.dc.html','lg',arrow=True)
    center_page(f, t, inner, h=1150, width=620)

# ---------- interactive onboarding ----------
@screen('ON-FLOW','Onboarding (interactive)','Onboarding','auth',('filled',))
def _(st, f, t):
    ACC = [('creator','Creator','I make content for my own channels.','smile','lime'),('business','Business','I post for my brand with a small team.','grid','blue'),('agency','Agency','I manage content for clients.','users','ai')]
    MODES = [('manual','Manual','You start every action. Agents help when asked.','pen','blue',''),('assisted','Assisted','Agents prepare drafts. Nothing publishes until you approve.','check','lime','Recommended'),('auto','Autonomous','Agents publish on their own within limits you set and confirm.','zap','ai','Needs authorization')]
    def ich(k, ti, sub, ic, tn, b=''):
        bg, fg = TONES()[tn]
        bb = f'<span style="padding: 3px 10px; border-radius: 999px; background: {T["aiT"]}; color: {T["aiTx"]}; font-size: 12px; font-weight: 800">{e(b)}</span>' if b else ''
        return f'<button type="button" onClick="{{{{ pick_{k} }}}}" aria-pressed="{{{{ pressed_{k} }}}}" style="text-align: left; display: flex; gap: 14px; align-items: center; padding: 18px; border-radius: 24px; border: 2px solid {{{{ bd_{k} }}}}; background: {{{{ bg_{k} }}}}; cursor: pointer; width: 100%; box-sizing: border-box; font-family: {BF}"><span aria-hidden="true" style="width: 52px; height: 52px; border-radius: 16px; background: {bg}; display: inline-flex; align-items: center; justify-content: center; flex: none">{icon(ic,26,fg)}</span><span style="flex-grow: 1; display: flex; flex-direction: column; gap: 3px"><span style="display: flex; gap: 8px; align-items: center"><span style="font-size: 17px; font-weight: 800; font-family: {HF}; color: {T["tx"]}">{e(ti)}</span>{bb}</span><span style="font-size: 14px; color: {T["mu"]}">{e(sub)}</span></span><span aria-hidden="true" style="width: 28px; height: 28px; border-radius: 50%; border: 2px solid {{{{ bd_{k} }}}}; background: {{{{ dot_{k} }}}}; flex: none; box-sizing: border-box"></span></button>'
    nav_ = lambda back=True, label='Continue': f'<div style="display: flex; align-items: center; gap: 10px">{"<button type=\"button\" onClick=\"{{ back }}\" style=\"padding: 12px 20px; border-radius: 999px; border: 2px solid transparent; background: transparent; color: "+T["tx"]+"; font-weight: 700; font-size: 15px; cursor: pointer; min-height: 48px; font-family: "+BF+"\">Back</button>" if back else ""}<div style="flex-grow: 1"></div><button type="button" onClick="{{{{ next }}}}" style="display: inline-flex; align-items: center; gap: 10px; padding: 8px 8px 8px 24px; border-radius: 999px; border: none; background: {T["ink"]}; color: {T["onink"]}; font-weight: 800; font-size: 16px; cursor: pointer; min-height: 54px; font-family: {BF}">{e(label)}{arrow_circle(T["lime"], OL, 38)}</button></div>'
    prog = ''.join(f'<span style="flex: 1; height: 6px; border-radius: 999px; background: {{{{ seg{k} }}}}"></span>' for k in range(4))
    HD = lambda a, b: H(a, 44) + P(b, size=17)
    s0 = f'<sc-if value="{{{{ s0 }}}}" hint-placeholder-val="{{{{ true }}}}"><div style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 22px; padding-top: 20px; position: relative">{art("welcome", 440)}<div style="position: absolute; top: 20px; right: 40px">{sticker("Hi Ada!","#FFD43B",8,"smile",16)}</div>{big("Meet your agents.", 64)}{P("Four quick questions and your studio is ready. Skip anything you like.", size=18)}<button type="button" onClick="{{{{ next }}}}" style="display: inline-flex; align-items: center; gap: 12px; padding: 10px 10px 10px 30px; border-radius: 999px; border: none; background: {T["ink"]}; color: {T["onink"]}; font-weight: 800; font-size: 18px; cursor: pointer; font-family: {BF}; min-height: 60px">Let’s go{arrow_circle(T["lime"], OL, 42)}</button>{small("Takes about a minute")}</div></sc-if>'
    s1 = f'<sc-if value="{{{{ s1 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 16px; {A("up")}">{HD("How will you use Nelio?","This shapes your workspace. You can change it later.")}' + ''.join(ich(*a) for a in ACC) + nav_() + '</div></sc-if>'
    gl = f'<div style="display: flex; flex-wrap: wrap; gap: 10px"><sc-for list="{{{{ goals }}}}" as="g" hint-placeholder-count="6"><button type="button" onClick="{{{{ g.toggle }}}}" aria-pressed="{{{{ g.pressed }}}}" style="padding: 12px 18px; border-radius: 999px; border: 2px solid {{{{ g.bd }}}}; background: {{{{ g.bg }}}}; color: {T["tx"]}; font-size: 15px; font-weight: 700; cursor: pointer; font-family: {BF}; min-height: 46px">{{{{ g.label }}}}</button></sc-for></div>'
    s2 = f'<sc-if value="{{{{ s2 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 16px; {A("up")}">{HD("What are you going for?","Pick as many as you like.")}{gl}' + grid([field('Your niche','','input','e.g. personal finance for students'), field('Main audience','Nigeria','select')], cols=2) + nav_() + '</div></sc-if>'
    def ic_(k, p, n):
        return f'<div style="display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 22px; border: 1px solid {T["bd"]}; background: {T["s1"]}">{plat(p,46)}<div style="flex-grow: 1"><div style="font-size: 16px; font-weight: 800">{n}</div><div style="font-size: 13px; color: {T["mu"]}">Official sign-in. We never see your password.</div></div><sc-if value="{{{{ c_{k} }}}}" hint-placeholder-val="{{{{ false }}}}">{chip("Connected","ok","check")}</sc-if><sc-if value="{{{{ nc_{k} }}}}" hint-placeholder-val="{{{{ true }}}}"><button type="button" onClick="{{{{ conn_{k} }}}}" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 999px; border: 2px solid {T["bd"]}; background: {T["s1"]}; color: {T["tx"]}; font-weight: 700; font-size: 14px; cursor: pointer; min-height: 44px; font-family: {BF}">{icon("link",16)}Connect</button></sc-if></div>'
    later = lambda p, n: f'<div style="display: flex; align-items: center; gap: 14px; padding: 16px; border-radius: 22px; border: 2px dashed {T["bd"]}">{plat(p,46)}<div style="flex-grow: 1; font-size: 16px; font-weight: 800">{n}</div>{chip("Coming later","neutral","clock")}</div>'
    s3 = f'<sc-if value="{{{{ s3 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 12px; {A("up")}">{HD("Connect your accounts","Optional. Agents can only post to accounts you connect.")}{ic_("ig","ig","Instagram")}{ic_("yt","yt","YouTube")}{later("tt","TikTok")}{later("fb","Facebook")}' + nav_() + '</div></sc-if>'
    an = f'<sc-if value="{{{{ isAuto }}}}" hint-placeholder-val="{{{{ false }}}}">{banner("ai","You’ll set the limits first","Autonomous publishing stays off until you confirm the account, how often and the budget for each agent.")}</sc-if>'
    s4 = f'<sc-if value="{{{{ s4 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 12px; {A("up")}">{HD("How hands-off should agents be?","You can change this per agent, any time.")}' + ''.join(ich(*m) for m in MODES) + an + nav_(label='Finish setup') + '</div></sc-if>'
    todo = lst([('Upload your first video','We’ll find the best moments', bubble('upload','lime',40), chip('Start here','blue')),('Add your brand kit','Colours, fonts and captions', bubble('palette','warn',40), ''),('Create your first agent','Or ask Nelio AI', bubble('bot','ai',40), '')])
    s5 = f'<sc-if value="{{{{ s5 }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 18px; align-items: stretch; {A("up")}"><div style="display: flex; justify-content: center">{art("success", 300)}</div>{big("You’re in.", 56)}{P("Your studio is ready. This checklist stays on your dashboard until it’s done.", size=16)}{todo}<a href="CommandCenter-Empty.dc.html" style="display: inline-flex; align-self: flex-start; align-items: center; gap: 12px; padding: 10px 10px 10px 28px; border-radius: 999px; background: {T["ink"]}; color: {T["onink"]}; font-weight: 800; font-size: 17px; text-decoration: none">Go to Command Center{arrow_circle(T["lime"], OL, 40)}</a></div></sc-if>'
    top = f'<header style="display: flex; align-items: center; gap: 16px; padding: 20px 32px">{logo(24)}<div style="flex-grow: 1"></div><sc-if value="{{{{ showSkip }}}}" hint-placeholder-val="{{{{ true }}}}"><button type="button" onClick="{{{{ skip }}}}" style="border: none; background: transparent; color: {T["tx"]}; font-weight: 700; font-size: 15px; cursor: pointer; font-family: {BF}; min-height: 44px">Skip for now</button></sc-if></header>'
    body = top + f'<main style="flex-grow: 1; display: flex; justify-content: center; padding: 16px 20px 64px"><div style="width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 26px"><sc-if value="{{{{ showProg }}}}" hint-placeholder-val="{{{{ false }}}}"><div style="display: flex; flex-direction: column; gap: 8px"><div style="display: flex; gap: 6px">{prog}</div><span style="font-size: 13px; color: {T["mu"]}; font-weight: 700">Step {{{{ stepNo }}}} of 4</span></div></sc-if>{s0}{s1}{s2}{s3}{s4}{s5}</div></main>'
    sc = '''class Component extends DCLogic {
  constructor(props) { super(props); this.state = { step: 0, acct: 'creator', mode: 'assisted', goals: ['Repurpose long videos'], conn: {} }; }
  renderVals() {
    const s = this.state, st = s.step;
    const sel = (on) => ({ bd: on ? '%A%' : '%BD%', bg: on ? '%AT%' : '%S1%', dot: on ? '%A%' : 'transparent', pressed: on ? 'true' : 'false' });
    const v = { s0: st === 0, s1: st === 1, s2: st === 2, s3: st === 3, s4: st === 4, s5: st === 5, showSkip: st > 0 && st < 5, showProg: st > 0 && st < 5, stepNo: st, isAuto: s.mode === 'auto',
      next: () => this.setState({ step: Math.min(5, st + 1) }), back: () => this.setState({ step: Math.max(0, st - 1) }), skip: () => this.setState({ step: Math.min(5, st + 1) }) };
    for (let k = 0; k < 4; k++) v['seg' + k] = k < st ? '%A%' : '%S3%';
    ['creator','business','agency'].forEach((k) => { const x = sel(s.acct === k); v['bd_' + k] = x.bd; v['bg_' + k] = x.bg; v['dot_' + k] = x.dot; v['pressed_' + k] = x.pressed; v['pick_' + k] = () => this.setState({ acct: k }); });
    ['manual','assisted','auto'].forEach((k) => { const x = sel(s.mode === k); v['bd_' + k] = x.bd; v['bg_' + k] = x.bg; v['dot_' + k] = x.dot; v['pressed_' + k] = x.pressed; v['pick_' + k] = () => this.setState({ mode: k }); });
    v.goals = ['Grow followers','Repurpose long videos','Post consistently','Drive sales','Build a community','Manage clients'].map((g) => { const on = s.goals.indexOf(g) >= 0; return { label: g, bd: on ? '%A%' : '%BD%', bg: on ? '%AT%' : '%S1%', pressed: on ? 'true' : 'false', toggle: () => this.setState({ goals: on ? s.goals.filter((x) => x !== g) : s.goals.concat([g]) }) }; });
    ['ig','yt'].forEach((k) => { v['c_' + k] = !!s.conn[k]; v['nc_' + k] = !s.conn[k]; v['conn_' + k] = () => this.setState({ conn: Object.assign({}, s.conn, { [k]: true }) }); });
    return v;
  }
}'''.replace('%A%', T['acc']).replace('%BD%', T['bd']).replace('%AT%', T['accT']).replace('%S1%', T['s1']).replace('%S3%', T['s3'])
    write(f, doc('Onboarding flow (interactive)', body, 1440, 1100, script=sc))
    REG[f]['interactive'] = True
build_all(only=['auth'])
