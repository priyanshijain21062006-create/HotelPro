import { useEffect, useState } from 'react';
import { ArrowRight, BedDouble, CalendarDays, Check, Compass, Menu, ShieldCheck, Sparkles, X } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const photo = (id, w = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const initialUser = () => { try { return JSON.parse(localStorage.getItem('hotelpro-user')); } catch { return null; } };

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

function App() {
  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(localStorage.getItem('hotelpro-token'));
  const [page, setPage] = useState('home');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [bookingRoom, setBookingRoom] = useState(null);
  const [adminTab, setAdminTab] = useState('bookings');
  const [authMode, setAuthMode] = useState('login');

  const tell = message => { setNotice(message); window.setTimeout(() => setNotice(''), 3600); };
  const go = next => { setPage(next); setMobileMenu(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const loadRooms = async () => { try { setRooms(await request('/rooms')); } catch { setRooms([]); } };
  const loadBookings = async () => { if (token) try { setBookings(await request('/bookings', { token })); } catch (e) { tell(e.message); } };

  useEffect(() => { loadRooms(); }, []);
  useEffect(() => { if (token) { loadBookings(); if (user?.role === 'admin') request('/admin/users', { token }).then(setUsers).catch(e => tell(e.message)); } }, [token, user?.role]);
  useEffect(() => { if (page === 'rooms') loadRooms(); }, [page]);

  function signedIn(data) {
    localStorage.setItem('hotelpro-token', data.token); localStorage.setItem('hotelpro-user', JSON.stringify(data.user));
    setToken(data.token); setUser(data.user); go(data.user.role === 'admin' ? 'admin' : 'dashboard');
  }
  function logout() { localStorage.removeItem('hotelpro-token'); localStorage.removeItem('hotelpro-user'); setToken(null); setUser(null); setBookings([]); go('home'); }

  async function submitAuth(event) {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget), payload = Object.fromEntries(form.entries());
    try {
      if (authMode === 'signup') { await request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }); tell('Your account is ready. Please sign in.'); setAuthMode('login'); }
      else signedIn(await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }));
    } catch (e) { tell(e.message); } finally { setBusy(false); }
  }

  async function createBooking(event) {
    event.preventDefault(); setBusy(true); const payload = Object.fromEntries(new FormData(event.currentTarget).entries()); payload.roomId = bookingRoom._id;
    try { await request('/bookings', { token, method: 'POST', body: JSON.stringify(payload) }); setBookingRoom(null); tell('Your stay is reserved.'); await loadBookings(); go('bookings'); }
    catch (e) { tell(e.message); } finally { setBusy(false); }
  }

  async function cancelBooking(id) {
    try { await request(`/bookings/${id}/cancel`, { token, method: 'PATCH' }); tell('Booking cancelled.'); await loadBookings(); }
    catch (e) { tell(e.message); }
  }

  async function addRoom(event) {
    event.preventDefault(); setBusy(true); const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    data.rent = Number(data.rent); data.count = Number(data.count); data.amenities = data.amenities.split(',').map(x => x.trim()).filter(Boolean); data.photos = data.photo ? [data.photo] : []; delete data.photo;
    try { await request('/admin/rooms', { token, method: 'POST', body: JSON.stringify(data) }); event.currentTarget.reset(); tell('Room added to your collection.'); await loadRooms(); setAdminTab('rooms'); }
    catch (e) { tell(e.message); } finally { setBusy(false); }
  }

  async function deleteRoom(id) {
    try { await request(`/admin/rooms/${id}`, { token, method: 'DELETE' }); tell('Room removed.'); await loadRooms(); }
    catch (e) { tell(e.message); }
  }

  return <>
    <header className="nav"><a className="brand" href="#home" onClick={() => go('home')}><span className="brand-mark">H</span><span>hotelpro<span className="brand-period">.</span></span></a>
      <button className="menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu ? <X /> : <Menu />}</button>
      <nav className={mobileMenu ? 'nav-links open' : 'nav-links'}>
        <a href="#rooms" onClick={() => go('rooms')}>Explore stays</a><a href="#about" onClick={() => go('home')}>Our story</a>
        {user ? <><span className="nav-user">Hi, {user.name.split(' ')[0]}</span>{user.role === 'admin' ? <button className="nav-cta" onClick={() => go('admin')}>Dashboard <ArrowRight size={15}/></button> : <button className="nav-cta" onClick={() => go('bookings')}>My stays <ArrowRight size={15}/></button>}<button className="nav-quiet" onClick={logout}>Log out</button></> : <><button className="nav-quiet" onClick={() => { setAuthMode('login'); go('auth'); }}>Log in</button><button className="nav-cta" onClick={() => { setAuthMode('signup'); go('auth'); }}>Join us <ArrowRight size={15}/></button></>}
      </nav>
    </header>

    {page === 'home' && <Home rooms={rooms} onExplore={() => go('rooms')} onBook={room => { setBookingRoom(room); if (!token) { setAuthMode('login'); tell('Sign in to reserve your stay.'); go('auth'); } }} />}
    {page === 'rooms' && <main className="page-shell"><div className="eyebrow"><span/> THE COLLECTION</div><h1 className="page-title">Find your <em>somewhere.</em></h1><p className="page-subtitle">A considered collection of rooms for slower mornings and longer stays.</p><RoomGrid rooms={rooms} onBook={room => token ? setBookingRoom(room) : (setAuthMode('login'), tell('Sign in to reserve your stay.'), go('auth'))}/></main>}
    {page === 'auth' && <Auth mode={authMode} setMode={setAuthMode} onSubmit={submitAuth} busy={busy} />}
    {page === 'dashboard' && <main className="page-shell"><div className="eyebrow"><span/> YOUR HOTELPRO</div><h1 className="page-title">Welcome back, <em>{user?.name.split(' ')[0]}.</em></h1><p className="page-subtitle">Ready to find your next favorite place?</p><div className="dash-actions"><button className="button button-dark" onClick={() => go('rooms')}>Explore rooms <ArrowRight size={17}/></button><button className="button button-light" onClick={() => go('bookings')}>View my bookings</button></div><h2 className="section-heading">Made for your next escape</h2><RoomGrid rooms={rooms.slice(0, 3)} onBook={room => setBookingRoom(room)}/></main>}
    {page === 'bookings' && <main className="page-shell"><div className="eyebrow"><span/> YOUR JOURNEYS</div><h1 className="page-title">My <em>bookings.</em></h1><p className="page-subtitle">Every good stay starts somewhere.</p><BookingList bookings={bookings} onCancel={cancelBooking}/></main>}
    {page === 'admin' && <main className="page-shell"><div className="eyebrow"><span/> HOTELPRO MANAGEMENT</div><h1 className="page-title">Good morning, <em>{user?.name.split(' ')[0]}.</em></h1><p className="page-subtitle">Your property, all in one place.</p><div className="admin-tabs">{[['bookings','Bookings'],['rooms','Rooms'],['add','Add a room'],['users','Guests']].map(([id,label])=><button className={adminTab===id?'active':''} onClick={()=>setAdminTab(id)} key={id}>{label}</button>)}</div>{adminTab==='bookings'&&<BookingList bookings={bookings} onCancel={cancelBooking} admin/>}{adminTab==='rooms'&&<RoomGrid rooms={rooms} admin onDelete={deleteRoom}/>}{adminTab==='add'&&<form className="form-card room-form" onSubmit={addRoom}><h2>Add to the collection</h2><div className="form-grid"><Field label="Room number" name="roomNumber" required/><label className="field"><span>Room type</span><select name="type"><option>Single</option><option>Double</option><option>Suite</option><option>Deluxe</option></select></label><Field label="Nightly rate (₹)" name="rent" type="number" min="0" required/><Field label="Available rooms" name="count" type="number" min="1" defaultValue="1" required/><Field label="Photo URL" name="photo"/><Field label="Amenities (comma separated)" name="amenities"/></div><label className="field"><span>Description</span><textarea name="description" required rows="3"/></label><button className="button button-dark" disabled={busy}>{busy?'Saving…':'Add room'} <ArrowRight size={17}/></button></form>}{adminTab==='users'&&<div className="table-wrap"><table><thead><tr><th>Guest</th><th>Email</th><th>Phone</th><th>Account</th></tr></thead><tbody>{users.map(u=><tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone}</td><td><span className="status-pill">{u.role}</span></td></tr>)}</tbody></table></div>}</main>}

    {bookingRoom && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setBookingRoom(null)}><form className="booking-modal" onSubmit={createBooking}><button type="button" className="modal-close" onClick={() => setBookingRoom(null)}><X/></button><div className="eyebrow"><span/> MAKE IT A STAY</div><h2>Reserve your <em>{bookingRoom.type.toLowerCase()}.</em></h2><p className="muted">{bookingRoom.description}</p><input type="hidden" name="guestName" value={user?.name || ''}/><label className="field"><span>Check in</span><input name="fromDate" type="date" required min={new Date().toISOString().slice(0,10)}/></label><label className="field"><span>Check out</span><input name="toDate" type="date" required min={new Date().toISOString().slice(0,10)}/></label><div className="modal-price"><span>From</span><strong>₹{bookingRoom.rent?.toLocaleString('en-IN')} <small>/ night</small></strong></div><button className="button button-dark full" disabled={busy}>{busy?'Reserving…':'Confirm reservation'} <ArrowRight size={17}/></button><p className="fine-print">Payment can be arranged securely with the property. Card details are never stored here.</p></form></div>}
    {notice && <div className="toast" role="status"><Check size={16}/>{notice}</div>}
    <Footer onHome={() => go('home')}/>
  </>;
}

function Home({ rooms, onExplore, onBook }) { return <>
  <section className="hero"><div className="hero-image"/><div className="hero-shade"/><div className="hero-content"><div className="eyebrow light"><span/> A MORE PERSONAL KIND OF STAY</div><h1>Stay a little<br/><em>closer</em> to wonder.</h1><p>Thoughtful places. Beautifully simple stays.<br/>Room to be exactly where you want to be.</p><button className="button button-cream" onClick={onExplore}>Explore the collection <ArrowRight size={17}/></button></div><div className="hero-index"><span>01</span><i/> 03</div><div className="hero-note"><Sparkles size={15}/> Thoughtful stays, seamlessly managed</div></section>
  <section className="intro" id="about"><div className="eyebrow"><span/> THE HOTELPRO WAY</div><div className="intro-grid"><h2>Good stays make<br/>room for <em>more.</em></h2><div><p>Less time figuring things out. More time noticing the light, finding the little café, and staying for one more night.</p><a className="text-link" href="#rooms" onClick={onExplore}>Find your stay <ArrowRight size={16}/></a></div></div><div className="value-row"><div><Compass/><h3>Places with a point of view</h3><p>Every room selected for how it makes you feel.</p></div><div><ShieldCheck/><h3>Easy from the start</h3><p>Clear details and a smooth booking, every time.</p></div><div><Sparkles/><h3>Space to settle in</h3><p>The details that make a stay feel like yours.</p></div></div></section>
  <section className="featured" id="rooms"><div className="featured-head"><div><div className="eyebrow"><span/> PLACES TO PAUSE</div><h2>Find your <em>somewhere.</em></h2></div><button className="text-link" onClick={onExplore}>View all stays <ArrowRight size={16}/></button></div><RoomGrid rooms={rooms.slice(0,3)} onBook={onBook}/></section>
  <section className="quote-band"><span>“</span><p>Travel should leave you feeling more like yourself.<br/>That’s where a good stay begins.</p><div>THE HOTELPRO PROMISE</div></section>
  </> }

function RoomGrid({ rooms, onBook, admin, onDelete }) { if (!rooms.length) return <div className="empty"><BedDouble size={27}/><p>No rooms listed yet.</p><span>Check back soon for new places to stay.</span></div>; return <div className="room-grid">{rooms.map((room,i)=><article className="room-card" key={room._id}><div className="room-photo"><img src={room.photos?.[0] || photo(['photo-1611892440504-42a792e24d32','photo-1616594039964-ae9021a400a0','photo-1566665797739-1674de7a421a'][i%3],700)} alt={`${room.type} room`} loading="lazy"/><span className="room-tag">{room.type}</span>{admin&&<button className="delete-room" onClick={()=>onDelete(room._id)} aria-label="Delete room"><X size={17}/></button>}</div><div className="room-info"><div className="room-meta"><span>ROOM {room.roomNumber}</span><span><Sparkles size={13}/> {room.amenities?.slice(0,2).join(' · ') || 'Thoughtfully appointed'}</span></div><h3>{room.description}</h3><div className="room-bottom"><span><strong>₹{Number(room.rent).toLocaleString('en-IN')}</strong> / night</span>{!admin&&<button onClick={()=>onBook(room)} aria-label="Book this room"><ArrowRight size={18}/></button>}</div></div></article>)}</div> }

function Field({label,...props}) { return <label className="field"><span>{label}</span><input {...props}/></label>; }

function Auth({ mode, setMode, onSubmit, busy }) { const signup=mode==='signup'; return <main className="auth-layout"><div className="auth-photo"><div className="eyebrow light"><span/> YOUR NEXT CHAPTER</div><h2>Somewhere<br/>to <em>begin again.</em></h2><p>Good trips stay with you.<br/>Let’s make one.</p></div><section className="auth-panel"><div className="eyebrow"><span/> {signup?'BECOME A GUEST':'WELCOME BACK'}</div><h1>{signup?'Make yourself':'Come on'} <em>at home.</em></h1><p className="muted">{signup?'Create your HotelPro account to save your favorite stays.':'Sign in to see your stays and pick up where you left off.'}</p><form className="auth-form" onSubmit={onSubmit}>{signup&&<Field label="Your name" name="name" autoComplete="name" required/>}<Field label="Email address" name="email" type="email" autoComplete="email" required/>{signup&&<Field label="Phone number" name="phone" type="tel" autoComplete="tel" required/>}<Field label="Password" name="password" type="password" autoComplete={signup?'new-password':'current-password'} minLength={signup?8:undefined} required/>{signup&&<Field label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required/>}<button className="button button-dark full" disabled={busy}>{busy?'One moment…':signup?'Create account':'Sign in'} <ArrowRight size={17}/></button></form><div className="auth-switch">{signup?'Already with us?':'New to HotelPro?'} <button onClick={()=>setMode(signup?'login':'signup')}>{signup?'Sign in':'Create an account'}</button></div><p className="auth-admin-note">Administrator accounts are created securely by the system owner.</p></section></main> }

function BookingList({ bookings, onCancel, admin }) { if (!bookings.length) return <div className="empty"><CalendarDays size={27}/><p>No stays on the books yet.</p><span>Your next journey is waiting to be planned.</span></div>; return <div className="booking-list">{bookings.map(b=><article className="booking-card" key={b._id}><div className="booking-room-image"><img src={b.room?.photos?.[0]||photo('photo-1611892440504-42a792e24d32',400)} alt="Booked room"/></div><div className="booking-details"><div className="booking-top"><div><span className="booking-id">BOOKING · {b._id.slice(-7).toUpperCase()}</span><h3>{b.room?.type || 'Room'} <span>· Room {b.room?.roomNumber}</span></h3></div><span className={`status ${b.status}`}>{b.status}</span></div><div className="booking-facts"><span><CalendarDays size={15}/>{new Date(b.fromDate).toLocaleDateString()} — {new Date(b.toDate).toLocaleDateString()}</span><span><BedDouble size={15}/>{b.totalDays} {b.totalDays===1?'night':'nights'}</span>{admin&&<span>{b.user?.name} · {b.user?.phone}</span>}</div><div className="booking-bottom"><strong>₹{Number(b.totalAmount).toLocaleString('en-IN')}</strong>{b.status==='active'&&<button className="cancel-link" onClick={()=>onCancel(b._id)}>Cancel booking</button>}</div></div></article>)}</div> }

function Footer({onHome}) { return <footer className="footer"><a className="brand footer-brand" href="#home" onClick={onHome}><span className="brand-mark">H</span><span>hotelpro<span className="brand-period">.</span></span></a><span>Thoughtful stays, beautifully simple.</span><span>© 2025 HotelPro</span></footer> }

export default App;
