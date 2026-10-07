import asyncio, hashlib, re
from playwright.async_api import async_playwright
import os, pathlib
OUT=str(pathlib.Path(__file__).parent/'out')+'/'
os.makedirs(OUT, exist_ok=True)
URL=os.environ.get('SITE_URL','http://127.0.0.1:8230/index.html')
fails=[]
def check(name, cond, extra=''):
    print(('PASS ' if cond else 'FAIL ')+name+(' '+str(extra) if extra!='' else ''))
    if not cond: fails.append(name)

def lum(rgb):
    f=lambda c: c/12.92 if c<=.03928 else ((c+.055)/1.055)**2.4
    r,g,b=[f(v/255) for v in rgb]; return .2126*r+.7152*g+.0722*b
def cr(a,b):
    la,lb=lum(a),lum(b)
    if la<lb: la,lb=lb,la
    return (la+.05)/(lb+.05)
def parse(c):
    m=re.findall(r'[\d.]+',c); return [float(x) for x in m[:3]]

async def canvas_hash(pg):
    d=await pg.evaluate("document.getElementById('bg').toDataURL()")
    return hashlib.md5(d.encode()).hexdigest()

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        # ---------- desktop dark PT ----------
        ctx=await b.new_context(viewport={'width':1440,'height':900}, color_scheme='dark', locale='pt-BR')
        pg=await ctx.new_page()
        logs=[]
        pg.on('console', lambda m: logs.append((m.type,m.text)))
        pg.on('pageerror', lambda e: logs.append(('pageerror',str(e))))
        pg.on('requestfailed', lambda r: logs.append(('requestfailed',r.url)))
        pg.on('response', lambda r: logs.append(('http',r.status,r.url)) if r.status>=400 else None)
        await pg.goto(URL)
        await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
        check('html lang pt-BR', await pg.evaluate("document.documentElement.lang")=='pt-BR')
        check('theme dark by default', await pg.evaluate("document.documentElement.dataset.theme")=='dark')
        await pg.wait_for_timeout(300)
        h1=await canvas_hash(pg); await pg.wait_for_timeout(2600); h2=await canvas_hash(pg); await pg.wait_for_timeout(700); h3=await canvas_hash(pg)
        check('canvas animates (intro + waves change between frames)', h1!=h2 and h2!=h3)
        # pause
        await pg.click('#anim-btn'); await pg.wait_for_timeout(200)
        check('pause button aria-pressed', await pg.get_attribute('#anim-btn','aria-pressed')=='true')
        a=await canvas_hash(pg); await pg.wait_for_timeout(800); c=await canvas_hash(pg)
        check('paused: frames identical', a==c)
        check('pause label changes', 'Retomar' in await pg.get_attribute('#anim-btn','aria-label'))
        await pg.click('#anim-btn'); await pg.wait_for_timeout(900); d=await canvas_hash(pg)
        check('resume: frames change again', d!=c)
        # horizontal scroll
        check('no horizontal scroll (desktop)', await pg.evaluate("document.documentElement.scrollWidth<=document.documentElement.clientWidth"))
        # theme toggle
        await pg.click('#theme-btn'); await pg.wait_for_timeout(300)
        check('theme -> light', await pg.evaluate("document.documentElement.dataset.theme")=='light')
        check('theme persisted', await pg.evaluate("localStorage.getItem('bt-theme')")=='light')
        check('theme label updated', 'escuro' in await pg.get_attribute('#theme-btn','aria-label'))
        bgc=parse(await pg.evaluate("getComputedStyle(document.documentElement).backgroundColor"))
        check('light bg is white', bgc==[255,255,255], bgc)
        # canvas redraws for light: line colors should be dark
        await pg.screenshot(path=OUT+'d-light-hero.png')
        # contrast numerically (light)
        async def pair(sel, prop='color'):
            return parse(await pg.evaluate(f"getComputedStyle(document.querySelector('{sel}')).{prop}"))
        for name,sel in [('lead','.lead'),('muted tag','.tags li'),('nav link','.nav a'),('section lead','.section-lead'),('service p','.service p'),('tag-own','.tag-own'),('email label','.email-label'),('footer','.footer-row p')]:
            col=await pair(sel); ratio=cr(col,[255,255,255]); check(f'light contrast {name} >=4.5', ratio>=4.5, f'{ratio:.2f}')
        # btn primary
        col=await pair('.btn-primary'); bgb=await pair('.btn-primary','backgroundColor'); check('light primary btn contrast', cr(col,bgb)>=4.5, f'{cr(col,bgb):.2f}')
        edge=parse(await pg.evaluate("getComputedStyle(document.querySelector('#f-name')).borderTopColor"))
        check('light input border >=3', cr(edge,[255,255,255])>=3, f'{cr(edge,[255,255,255]):.2f}')
        # dark again
        await pg.click('#theme-btn'); await pg.wait_for_timeout(300)
        for name,sel in [('lead','.lead'),('muted tag','.tags li'),('nav link','.nav a'),('tag-own','.tag-own'),('footer','.footer-row p')]:
            col=await pair(sel); ratio=cr(col,[0,0,0]); check(f'dark contrast {name} >=4.5', ratio>=4.5, f'{ratio:.2f}')
        col=await pair('.btn-primary'); bgb=await pair('.btn-primary','backgroundColor'); check('dark primary btn contrast', cr(col,bgb)>=4.5, f'{cr(col,bgb):.2f}')
        edge=parse(await pg.evaluate("getComputedStyle(document.querySelector('#f-name')).borderTopColor"))
        check('dark input border >=3', cr(edge,[0,0,0])>=3, f'{cr(edge,[0,0,0]):.2f}')
        # ---------- language ----------
        await pg.click('[data-lang="en"]'); await pg.wait_for_timeout(300)
        check('html lang en', await pg.evaluate("document.documentElement.lang")=='en')
        check('h1 in English', 'Websites designed' in await pg.inner_text('h1'))
        check('title in English', 'web design and development' in await pg.title())
        check('img alt translated', 'Home screen' in await pg.get_attribute('.case img','alt'))
        check('placeholder translated', 'What do you want' in await pg.get_attribute('#f-msg','placeholder'))
        check('meta desc translated', 'two-person studio' in await pg.get_attribute('meta[name=description]','content'))
        check('theme label EN', 'Switch to' in await pg.get_attribute('#theme-btn','aria-label'))
        missing=await pg.evaluate("""()=>{const out=[];document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.getAttribute('data-i18n'); if(e.textContent===k) out.push(k)});return out}""")
        check('no raw i18n keys visible in EN', not missing, missing)
        await pg.screenshot(path=OUT+'d-dark-en-hero.png')
        await pg.reload(); await pg.wait_for_timeout(400)
        check('language persists after reload', await pg.evaluate("document.documentElement.lang")=='en')
        await pg.click('[data-lang="pt"]'); await pg.wait_for_timeout(200)
        check('back to PT', 'Sites desenhados' in await pg.inner_text('h1'))
        # ---------- vitrine de projetos (abas) ----------
        await pg.evaluate("document.querySelector('.showcase').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
        check('tabs: 4 tabs built, tablist visible', await pg.evaluate("document.querySelectorAll('[role=tab]').length")==4 and await pg.is_visible('.tabs'))
        check('tabs: first selected, only its panel visible', await pg.evaluate("[...document.querySelectorAll('.case')].map(c=>!c.hidden).join()")=='true,false,false,false' and await pg.get_attribute('#tab-1','aria-selected')=='true')
        check('tabs: roving tabindex', await pg.evaluate("[...document.querySelectorAll('[role=tab]')].map(t=>t.tabIndex).join()")=='0,-1,-1,-1')
        check('tabs: aria links (controls/labelledby)', await pg.evaluate("[...document.querySelectorAll('[role=tab]')].every(t=>document.getElementById(t.getAttribute('aria-controls')).getAttribute('aria-labelledby')===t.id)"))
        await pg.click('#tab-3'); await pg.wait_for_timeout(300)
        check('tabs: click switches panel', await pg.is_visible('#case-3') and not await pg.is_visible('#case-1') and await pg.get_attribute('#tab-3','aria-selected')=='true')
        check('tabs: image of tab 3 loaded', await pg.evaluate("(()=>{const i=document.querySelector('#case-3 img');return i.complete&&i.naturalWidth>0})()"))
        await pg.focus('#tab-3'); await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(200)
        check('tabs: ArrowRight -> tab 4 selected and focused', await pg.get_attribute('#tab-4','aria-selected')=='true' and await pg.evaluate("document.activeElement.id")=='tab-4')
        await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(200)
        check('tabs: ArrowRight wraps to tab 1', await pg.get_attribute('#tab-1','aria-selected')=='true')
        await pg.keyboard.press('End'); await pg.wait_for_timeout(200)
        check('tabs: End -> last tab', await pg.get_attribute('#tab-4','aria-selected')=='true')
        await pg.keyboard.press('Home'); await pg.keyboard.press('ArrowLeft'); await pg.wait_for_timeout(200)
        check('tabs: ArrowLeft wraps to last', await pg.get_attribute('#tab-4','aria-selected')=='true')
        imgs=await pg.evaluate("[...document.querySelectorAll('.case img')].map(i=>{const p=i.closest('.case');p.hidden=false;const ok=i.complete&&i.naturalWidth>0;p.hidden=!ok&&false;return ok})")
        check('tabs: all 4 case images load', all(imgs), imgs)
        await pg.click('#tab-1')
        await pg.click('[data-lang="en"]'); await pg.wait_for_timeout(200)
        check('tabs: tablist label translated', await pg.get_attribute('.tabs','aria-label')=='Projects')
        await pg.click('[data-lang="pt"]')
        # ---------- form ----------
        await pg.evaluate("document.getElementById('contato').scrollIntoView()")
        await pg.click('#submit-btn'); await pg.wait_for_timeout(200)
        check('form: 3 field errors shown', await pg.evaluate("[...document.querySelectorAll('.field-error')].filter(e=>!e.hidden&&e.textContent).length")==3)
        check('form: focus goes to first invalid', await pg.evaluate("document.activeElement.id")=='f-name')
        await pg.fill('#f-name','Ana'); await pg.fill('#f-email','ana@@x'); await pg.fill('#f-msg','Quero um site.')
        await pg.click('#submit-btn'); await pg.wait_for_timeout(200)
        check('form: invalid email message', 'e-mail válido' in await pg.inner_text('#f-email-err'))
        await pg.fill('#f-email','ana@exemplo.com'); await pg.click('#submit-btn'); await pg.wait_for_timeout(200)
        st=await pg.inner_text('#form-status')
        check('form: honest message when endpoint is empty', 'ainda não está ativo' in st, st)
        await pg.click('[data-lang="en"]'); await pg.wait_for_timeout(200)
        check('form status follows language', 'not active yet' in await pg.inner_text('#form-status'))
        await pg.click('[data-lang="pt"]')
        await pg.screenshot(path=OUT+'d-dark-form-state.png')
        # copy email
        await ctx.grant_permissions(['clipboard-read','clipboard-write'])
        await pg.click('#copy-btn'); await pg.wait_for_timeout(300)
        check('copy email feedback', 'copiado' in (await pg.inner_text('#copy-status')).lower())
        # keyboard focus visible
        await pg.goto(URL); await pg.wait_for_timeout(300)
        await pg.evaluate("document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0,0)"); await pg.wait_for_timeout(200)
        await pg.keyboard.press('Tab'); await pg.wait_for_timeout(100)
        sk=await pg.evaluate("(()=>{const e=document.activeElement;const r=e.getBoundingClientRect();return [e.className, r.top>=0]})()")
        check('skip link focusable and visible', sk[0]=='skip' and sk[1], sk)
        await pg.keyboard.press('Tab')
        ow=await pg.evaluate("getComputedStyle(document.activeElement).outlineStyle+' '+getComputedStyle(document.activeElement).outlineWidth")
        check('focus outline present', 'solid' in ow, ow)
        # logs
        bad=[l for l in logs if l[0] in ('error','warning','pageerror','requestfailed') or l[0]=='http']
        check('console/network clean (desktop)', not bad, bad)
        await ctx.close()

        # ---------- mobile ----------
        for w,hh in [(390,844),(360,740)]:
            ctx=await b.new_context(viewport={'width':w,'height':hh}, color_scheme='dark', locale='pt-BR', device_scale_factor=2, is_mobile=True, has_touch=True)
            pg=await ctx.new_page(); logs=[]
            pg.on('console', lambda m: logs.append((m.type,m.text)))
            pg.on('pageerror', lambda e: logs.append(('pageerror',str(e))))
            await pg.goto(URL); await pg.wait_for_timeout(2600)
            await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
            sw=await pg.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
            check(f'{w}px no horizontal scroll', sw[0]<=sw[1], sw)
            await pg.screenshot(path=OUT+f'm{w}-hero.png')
            check(f'{w}px menu button visible, nav hidden', await pg.is_visible('#menu-btn') and not await pg.is_visible('#nav'))
            await pg.click('#menu-btn'); await pg.wait_for_timeout(200)
            check(f'{w}px menu opens', await pg.is_visible('#nav') and await pg.get_attribute('#menu-btn','aria-expanded')=='true')
            check(f'{w}px lang+pause reachable in menu', await pg.is_visible('[data-lang="en"]') and await pg.is_visible('#anim-btn'))
            await pg.screenshot(path=OUT+f'm{w}-menu.png')
            await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
            check(f'{w}px Escape closes menu', not await pg.is_visible('#nav'))
            await pg.click('#menu-btn'); await pg.click('#nav a[href="#cases"]'); await pg.wait_for_timeout(700)
            check(f'{w}px menu closes after link', not await pg.is_visible('#nav'))
            # header overlap check
            hdr=await pg.evaluate("(()=>{const r=document.querySelector('.header-row');return [r.scrollWidth,r.clientWidth]})()")
            check(f'{w}px header fits', hdr[0]<=hdr[1], hdr)
            for sid in ['servicos','cases','sobre','processo','contato']:
                await pg.evaluate(f"document.getElementById('{sid}').scrollIntoView()"); await pg.wait_for_timeout(450)
                await pg.screenshot(path=OUT+f'm{w}-{sid}.png')
            bad=[l for l in logs if l[0] in ('error','warning','pageerror')]
            check(f'{w}px console clean', not bad, bad)
            await ctx.close()

        # ---------- sem JavaScript ----------
        ctx=await b.new_context(viewport={'width':1280,'height':800}, java_script_enabled=False, locale='pt-BR')
        pg=await ctx.new_page(); await pg.goto(URL); await pg.wait_for_timeout(500)
        check('no-JS: tablist stays hidden', not await pg.is_visible('.tabs'))
        vis=[await pg.is_visible(f'#case-{i}') for i in (1,2,3,4)]
        check('no-JS: all 4 projects visible', all(vis), vis)
        check('no-JS: Portuguese content present', 'Sites desenhados' in await pg.inner_text('h1'))
        await ctx.close()

        # ---------- reduced motion ----------
        ctx=await b.new_context(viewport={'width':1280,'height':800}, reduced_motion='reduce', color_scheme='light', locale='en-US')
        pg=await ctx.new_page(); await pg.goto(URL); await pg.wait_for_timeout(1200)
        check('reduced motion: starts paused', await pg.get_attribute('#anim-btn','aria-pressed')=='true')
        a=await canvas_hash(pg); await pg.wait_for_timeout(1200); c=await canvas_hash(pg)
        check('reduced motion: static', a==c)
        check('reduced motion: full curve is drawn (not blank)', await pg.evaluate("(()=>{const c=document.getElementById('bg');const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4*50) if(d[i]>0) n++;return n})()")>200)
        check('light theme from system preference', await pg.evaluate("document.documentElement.dataset.theme")=='light')
        check('EN from browser locale en-US', await pg.evaluate("document.documentElement.lang")=='en')
        await pg.screenshot(path=OUT+'d-light-en-hero.png')
        await ctx.close()
        await b.close()
    print('\nFAILS:',fails)
asyncio.run(main())
