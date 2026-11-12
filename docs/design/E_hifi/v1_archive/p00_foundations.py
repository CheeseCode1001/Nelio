from lib import *
CUR['page'] = 'foundations'
theme('dark')

def swatch(name, hexv, fg='#0D0D12', note=''):
    return f'<div style="display: flex; flex-direction: column; gap: 8px; min-width: 0"><div style="height: 84px; border-radius: 16px; background: {hexv}; border: 1px solid {T["bd"]}; display: flex; align-items: flex-end; padding: 10px; box-sizing: border-box"><span style="font-size: 12px; font-weight: 700; color: {fg}">{e(hexv)}</span></div><div style="font-size: 13px; font-weight: 700">{e(name)}</div><div style="font-size: 12px; color: {T["mu"]}">{e(note)}</div></div>'

dark_sw = grid([swatch('Ink · background','#0D0D12','#F5F5F7','Page'), swatch('Surface 1','#16161E','#F5F5F7','Cards, nav'), swatch('Surface 2','#1F1F2A','#F5F5F7','Inputs, wells'),
                swatch('Volt','#D4FF3F','#0D0D12','Primary action, focus, “on”'), swatch('Grape','#B7A4FF','#0D0D12','Nelio AI, agents, badges'), swatch('Text','#F5F5F7','#0D0D12','Body text'),
                swatch('Muted text','#A9A9BC','#0D0D12','Labels (7.9:1 on Surface 1)'), swatch('Info blue','#6CB4FF','#0D0D12','Info, scheduled'), swatch('Warning orange','#FFB547','#0D0D12','Needs attention, blocked'),
                swatch('Danger','#FF7A7A','#0D0D12','Failed, revoked'), swatch('Success teal','#3DDBA0','#0D0D12','Published, approved'), swatch('Border','#2E2E3C','#F5F5F7','Dividers')], cols=6, gap=14)
light_sw = grid([swatch('Paper','#F6F6F1','#121218','Page'), swatch('Surface 1','#FFFFFF','#121218','Cards'), swatch('Volt (fill only)','#D4FF3F','#0D0D12','Never as text on white'),
                 swatch('Grape deep','#5333D6','#FFFFFF','AI, links (6.2:1 on tint)'), swatch('Text','#121218','#FFFFFF','Body'), swatch('Muted','#55556A','#FFFFFF','Labels (7.2:1)')], cols=6, gap=14)

type_ = col(
  f'<div style="font-family: {HF}; font-weight: 800; font-size: 64px; letter-spacing: -0.04em; line-height: 1">Display 64 · Bricolage Grotesque 800</div>',
  f'<div style="font-family: {HF}; font-weight: 800; font-size: 34px; letter-spacing: -0.02em">Page title 34 · 800</div>',
  f'<div style="font-family: {HF}; font-weight: 700; font-size: 20px">Section 20 · 700</div>',
  f'<div style="font-size: 16px; font-weight: 600">Body strong 16 · Inter 600</div>',
  f'<div style="font-size: 14px; color: {T["mu"]}">Body 14 · Inter 400, line-height 1.5</div>',
  f'<div style="font-size: 12px; font-weight: 600; color: {T["mu"]}; text-transform: uppercase; letter-spacing: 0.06em">Label 12 · caps</div>', gap=14)

buttons = row(btn('Generate clips','primary','spark'), btn('Ask Nelio AI','grape','spark'), btn('Save draft','secondary'), btn('Cancel','ghost'), btn('Revoke','danger'), btn('Small','primary',size='sm'), ibtn('more','More'), gap=10)
chips = row(chip('active','lime','zap'), chip('Nelio AI','grape','spark'), chip('scheduled','blue','clock'), chip('needs approval','orange','alert'), chip('failed','red','x'), chip('published','teal','check'), chip('draft'), chip('locked','neutral','lock'), gap=8)
inputs = grid([field('Workspace name','Ada Studio'), field('Niche','','input','e.g. personal finance', hint='Helps agents find the right topics'), field('Email','ada@','email', err='Enter a full email address')], cols=3)
ctrls = grid([col(check('Client approval required', True), check('Approve each platform separately', True), check('Let clients see analytics')), col(toggle('Autonomous publishing', False, 'Needs your authorization'), toggle('Email me when renders finish', True))], cols=2, gap=24)
choices = grid([choice('Assisted','Agents prepare, you approve.', True, 'check', 'lime', 'Recommended'), choice('Autonomous','Agents publish within your limits.', False, 'zap', 'grape', 'Paid plans', locked=True)], cols=2)
banners = col(banner('orange','Recipe Reels is paused','It hit its weekly budget of 300 credits.','Raise limit'), banner('red','License revoked','2 drafts and 1 scheduled post are on hold.','Review'), banner('grape','Nelio AI suggestion','Post at 18:00 on Fridays. Your audience is most active then.','Apply'), banner('teal','Published to Instagram','Confirmed by Instagram at 18:02.'), gap=10)
avatars = row(agent('lime','circle',48), agent('grape','blob',48), agent('blue','square',48), agent('orange','pill',48), agent('teal','blob',48), agent('pink','circle',48), plat('yt',40), plat('ig',40), plat('tt',40), plat('fb',40), person('AO',T['orange'],40,'#0D0D12'), gap=12)
meters = grid([meter('Credits used this month', 38, '760 / 2,000'), meter('Weekly agent budget', 92, '276 / 300', 'orange'), meter('Trial exports', 50, '1 / 2', 'grape')], cols=3, gap=20)

ai = card(row(bubble('spark','grape',56), col(H('Nelio AI', 24), P('The AI is always presented as Nelio AI: one name and one spark mark, used everywhere. The product never names the models or vendors behind it, in the UI, emails, errors or AI-written text.'), gap=4), gap=16), bg=T['grapeT'], bd=False)

rules = card(h3('Rules of the look'), lst([
  ('Flat colour only','No gradients, no glows, no glassmorphism. Fun comes from colour blocks, bold type and playful agents.', bubble('palette','lime',36)),
  ('Volt means go','Volt is reserved for the primary action, active state and focus ring. One volt button per view.', bubble('zap','lime',36)),
  ('Grape means AI','Anything Nelio AI or an agent did or suggests carries grape.', bubble('spark','grape',36)),
  ('Status never by colour alone','Every status chip has an icon and a word. Orange/blue pairs are used over red/green.', bubble('eye','blue',36)),
  ('Honest states','“In development”, “Coming later”, “Confirming with Instagram”: never fake success or progress.', bubble('shield','teal',36)),
  ('Touch and focus','Targets ≥ 44 px. Focus = 3 px volt outline with 2 px offset. Respects reduced motion.', bubble('phone','orange',36))]))

inner = (
  row(logo(56), grow(), chip('Design system v1','grape'), chip('Dark default · Light parity','neutral'), gap=12) +
  P('Nelio is a fun, confident AI content studio. It feels like a creative tool, not an enterprise console: big type, punchy colour blocks, characterful agents and zero gradients.', size=18, color=T['tx']) +
  card(card_head('Colour · Dark (default)'), dark_sw) +
  card(card_head('Colour · Light'), f'<div style="padding: 16px; border-radius: 16px; background: #F6F6F1">{light_sw}</div>') +
  grid([card(card_head('Type'), type_), col(ai, card(card_head('Agents & platforms'), avatars, P('Agents are friendly flat shapes with two eyes. Colour and shape stay fixed per agent so users recognise them.', size=13)))], cols=2, gap=20) +
  card(card_head('Buttons'), buttons) + card(card_head('Status chips'), chips) +
  card(card_head('Inputs'), inputs, ctrls) + card(card_head('Choice cards'), choices) +
  grid([card(card_head('Banners'), banners), card(card_head('Meters'), meters, card_head('Radius & spacing'), P('Radius 12 (controls) · 16 (rows, banners) · 20 (cards) · 24 (empty states, modals) · 999 (chips). Spacing on a 4 px grid: 8 · 12 · 16 · 20 · 24 · 32 · 48.', size=13))], cols=2, gap=20) +
  rules
)
body = f'<main style="padding: 56px; display: flex; flex-direction: column; gap: 24px; max-width: 1328px">{inner}</main>'
write('Main.dc.html', doc('Nelio design foundations', body, 1440, 3000))
