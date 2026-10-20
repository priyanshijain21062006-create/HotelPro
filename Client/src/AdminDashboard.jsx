import { useState } from 'react';
import { ArrowRight, BedDouble, Building2, CalendarDays, Check, CircleDollarSign, MapPin, Pencil, Plus, Power, Trash2, Users } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

export default function AdminDashboard({ user, token, rooms, bookings, users, hotels, loadRooms, loadHotels, loadUsers, tell, onCancelBooking }) {
  const [tab, setTab] = useState('overview');
  const [editingHotel, setEditingHotel] = useState(null);
  const [busy, setBusy] = useState(false);
  const completedRevenue = bookings.filter(booking => booking.status === 'completed').reduce((sum, booking) => sum + Number(booking.totalAmount || 0), 0);

  async function saveHotel(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.photos = data.photo ? [data.photo] : [];
    data.amenities = data.amenities.split(',').map(item => item.trim()).filter(Boolean);
    delete data.photo;
    setBusy(true);
    try {
      await request(editingHotel ? `/admin/hotels/${editingHotel._id}` : '/admin/hotels', { token, method: editingHotel ? 'PATCH' : 'POST', body: JSON.stringify(data) });
      form.reset(); setEditingHotel(null); tell(editingHotel ? 'Hotel details updated.' : 'Hotel added to your portfolio.');
      await loadHotels(); setTab('hotels');
    } catch (error) { tell(error.message); } finally { setBusy(false); }
  }

  async function setHotelActive(hotel) {
    try {
      await request(`/admin/hotels/${hotel._id}`, { token, method: 'PATCH', body: JSON.stringify({ isActive: !hotel.isActive }) });
      tell(hotel.isActive ? 'Hotel paused. It is hidden from guests.' : 'Hotel is accepting guest bookings again.'); await loadHotels();
    } catch (error) { tell(error.message); }
  }

  async function removeHotel(hotel) {
    if (!window.confirm(`Delete ${hotel.name}? Hotels with rooms must have those rooms removed first.`)) return;
    try { await request(`/admin/hotels/${hotel._id}`, { token, method: 'DELETE' }); tell('Hotel deleted.'); await loadHotels(); }
    catch (error) { tell(error.message); }
  }

  async function addRoom(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    data.rent = Number(data.rent); data.count = Number(data.count);
    data.amenities = data.amenities.split(',').map(item => item.trim()).filter(Boolean);
    data.photos = data.photo ? [data.photo] : [];
    delete data.photo;
    setBusy(true);
    try { await request('/admin/rooms', { token, method: 'POST', body: JSON.stringify(data) }); form.reset(); tell('Room added to your hotel.'); await loadRooms(); setTab('rooms'); }
    catch (error) { tell(error.message); } finally { setBusy(false); }
  }

  async function removeRoom(room) {
    if (!window.confirm(`Delete room ${room.roomNumber}?`)) return;
    try { await request(`/admin/rooms/${room._id}`, { token, method: 'DELETE' }); tell('Room deleted.'); await loadRooms(); }
    catch (error) { tell(error.message); }
  }

  async function changeRole(account, role) {
    try { await request(`/admin/users/${account._id}/role`, { token, method: 'PATCH', body: JSON.stringify({ role }) }); tell(`${account.name} is now ${role}.`); await loadUsers(); }
    catch (error) { tell(error.message); }
  }

  const tabs = [['overview', 'Overview'], ['hotels', 'Hotels'], ['rooms', 'Rooms'], ['bookings', 'Bookings'], ['guests', 'Guests'], ['add-room', 'Add room'], ['add-hotel', 'Add hotel']];

  return <main className="page-shell admin-shell">
    <div className="eyebrow"><span/> HOTELPRO MANAGEMENT</div>
    <h1 className="page-title">Good morning, <em>{user?.name.split(' ')[0]}.</em></h1>
    <p className="page-subtitle">Your properties, people, and bookings in one place.</p>
    <div className="admin-tabs">{tabs.map(([id, label]) => <button className={tab === id ? 'active' : ''} onClick={() => { setTab(id); if (id === 'add-hotel') setEditingHotel(null); }} key={id}>{label}</button>)}</div>

    {tab === 'overview' && <>
      <div className="admin-stats">
        <Stat icon={<Building2/>} label="Hotels" value={hotels.length} detail={`${hotels.filter(hotel => hotel.isActive).length} accepting bookings`}/>
        <Stat icon={<BedDouble/>} label="Rooms" value={rooms.length} detail="Across your portfolio"/>
        <Stat icon={<CalendarDays/>} label="Bookings" value={bookings.length} detail={`${bookings.filter(b => b.status === 'active').length} active`}/>
        <Stat icon={<Users/>} label="Guest accounts" value={users.length} detail="Registered customers"/>
        <Stat icon={<CircleDollarSign/>} label="Completed revenue" value={`₹${completedRevenue.toLocaleString('en-IN')}`} detail="From completed stays"/>
      </div>
      <div className="admin-overview-grid">
        <section className="admin-panel"><div className="admin-panel-head"><div><div className="eyebrow"><span/> YOUR PORTFOLIO</div><h2>Hotels</h2></div><button className="text-link" onClick={() => setTab('hotels')}>Manage hotels <ArrowRight size={15}/></button></div>
          {hotels.slice(0, 3).map(hotel => <div className="overview-hotel" key={hotel._id}><img src={hotel.photos?.[0] || '/images/hero-hotel.jpg'} alt=""/><div><strong>{hotel.name}</strong><span>{hotel.city}, {hotel.country}</span></div><span className={`status ${hotel.isActive ? 'active' : 'cancelled'}`}>{hotel.isActive ? 'Active' : 'Paused'}</span></div>)}
          {!hotels.length && <p className="muted">Add your first hotel to get started.</p>}
        </section>
        <section className="admin-panel"><div className="admin-panel-head"><div><div className="eyebrow"><span/> RECENT ACTIVITY</div><h2>Latest bookings</h2></div><button className="text-link" onClick={() => setTab('bookings')}>View bookings <ArrowRight size={15}/></button></div>
          {bookings.slice(0, 4).map(booking => <div className="overview-booking" key={booking._id}><span className={`status ${booking.status}`}>{booking.status}</span><div><strong>{booking.guestName}</strong><span>{booking.room?.hotel?.name || 'Hotel'} · Room {booking.room?.roomNumber}</span></div><b>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</b></div>)}
          {!bookings.length && <p className="muted">Bookings will appear here.</p>}
        </section>
      </div>
    </>}

    {tab === 'hotels' && <section className="hotel-admin-grid">
      {hotels.map(hotel => <article className="hotel-admin-card" key={hotel._id}>
        <div className="hotel-admin-photo"><img src={hotel.photos?.[0] || '/images/hero-hotel.jpg'} alt={`${hotel.name}`} /><span className={`status ${hotel.isActive ? 'active' : 'cancelled'}`}>{hotel.isActive ? 'Active' : 'Paused'}</span></div>
        <div className="hotel-admin-copy"><div className="eyebrow"><span/> {hotel.city}, {hotel.country}</div><h2>{hotel.name}</h2><p>{hotel.description}</p><span className="hotel-address"><MapPin size={14}/>{hotel.address}</span><div className="hotel-amenities">{hotel.amenities?.slice(0, 4).map(item => <span key={item}>{item}</span>)}</div>
          <div className="hotel-actions"><button className="button button-light" onClick={() => { setEditingHotel(hotel); setTab('add-hotel'); }}><Pencil size={14}/> Edit</button><button className="button button-light" onClick={() => setHotelActive(hotel)}><Power size={14}/>{hotel.isActive ? 'Pause' : 'Activate'}</button><button className="icon-action danger" onClick={() => removeHotel(hotel)} aria-label={`Delete ${hotel.name}`}><Trash2 size={16}/></button></div>
        </div>
      </article>)}
      <button className="hotel-add-card" onClick={() => { setEditingHotel(null); setTab('add-hotel'); }}><span><Plus/></span><strong>Add another hotel</strong><small>Manage a new property in your portfolio</small></button>
    </section>}

    {tab === 'rooms' && <div className="table-wrap"><table><thead><tr><th>Room</th><th>Hotel</th><th>Type</th><th>Nightly rate</th><th>Rooms</th><th>Photo</th><th/></tr></thead><tbody>{rooms.map(room => <tr key={room._id}><td>{room.roomNumber}</td><td>{room.hotel?.name || '—'}</td><td>{room.type}</td><td>₹{Number(room.rent).toLocaleString('en-IN')}</td><td>{room.count}</td><td>{room.photos?.length ? 'Added' : 'None'}</td><td><button className="icon-action danger" onClick={() => removeRoom(room)} aria-label={`Delete room ${room.roomNumber}`}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>}

    {tab === 'bookings' && <div className="table-wrap"><table><thead><tr><th>Guest</th><th>Hotel / room</th><th>Stay</th><th>Total</th><th>Status</th><th/></tr></thead><tbody>{bookings.map(booking => <tr key={booking._id}><td>{booking.guestName}<small className="cell-sub">{booking.user?.email}</small></td><td>{booking.room?.hotel?.name || '—'}<small className="cell-sub">Room {booking.room?.roomNumber} · {booking.room?.type}</small></td><td>{new Date(booking.fromDate).toLocaleDateString()} – {new Date(booking.toDate).toLocaleDateString()}</td><td>₹{Number(booking.totalAmount).toLocaleString('en-IN')}</td><td><span className={`status ${booking.status}`}>{booking.status}</span></td><td>{booking.status === 'active' && <button className="cancel-link" onClick={() => onCancelBooking(booking._id)}>Cancel</button>}</td></tr>)}</tbody></table></div>}

    {tab === 'guests' && <div className="table-wrap"><table><thead><tr><th>Guest</th><th>Email</th><th>Phone</th><th>Role</th><th>Access</th></tr></thead><tbody>{users.map(account => <tr key={account._id}><td>{account.name}</td><td>{account.email}</td><td>{account.phone}</td><td><span className="status-pill">{account.role}</span></td><td><select className="role-select" value={account.role} disabled={account._id === user?.id} onChange={event => changeRole(account, event.target.value)}><option value="customer">Customer</option><option value="admin">Admin</option></select></td></tr>)}</tbody></table><p className="table-note">Your own administrator role is locked to prevent accidental lockout.</p></div>}

    {tab === 'add-room' && <form className="form-card room-form" onSubmit={addRoom}><h2>Add a room</h2><div className="form-grid"><label className="field"><span>Hotel</span><select name="hotelId" required defaultValue=""><option value="" disabled>Select a hotel</option>{hotels.filter(hotel => hotel.isActive).map(hotel => <option value={hotel._id} key={hotel._id}>{hotel.name} — {hotel.city}</option>)}</select></label><AdminField label="Room number" name="roomNumber" required/><label className="field"><span>Room type</span><select name="type"><option>Single</option><option>Double</option><option>Suite</option><option>Deluxe</option></select></label><AdminField label="Nightly rate (₹)" name="rent" type="number" min="0" required/><AdminField label="Available rooms" name="count" type="number" min="1" defaultValue="1" required/><label className="field"><span>Room photo</span><select name="photo"><option value="/images/room-double.jpg">Warm double room</option><option value="/images/room-deluxe.jpg">Garden deluxe room</option><option value="/images/room-suite.jpg">Suite room</option><option value="/images/hotel-lobby.jpg">Quiet city hideaway</option></select></label><AdminField label="Amenities (comma separated)" name="amenities"/></div><label className="field"><span>Description</span><textarea name="description" required rows="3"/></label><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : 'Add room'} <ArrowRight size={17}/></button></form>}

    {tab === 'add-hotel' && <form className="form-card hotel-form" onSubmit={saveHotel} key={editingHotel?._id || 'new'}><div className="eyebrow"><span/> PROPERTY DETAILS</div><h2>{editingHotel ? `Edit ${editingHotel.name}` : 'Add a hotel'}</h2><div className="form-grid"><AdminField label="Hotel name" name="name" required defaultValue={editingHotel?.name || ''}/><AdminField label="Street address" name="address" required defaultValue={editingHotel?.address || ''}/><AdminField label="City" name="city" required defaultValue={editingHotel?.city || ''}/><AdminField label="Country" name="country" required defaultValue={editingHotel?.country || ''}/><AdminField label="Contact email" name="contactEmail" type="email" defaultValue={editingHotel?.contactEmail || ''}/><AdminField label="Contact phone" name="contactPhone" defaultValue={editingHotel?.contactPhone || ''}/><AdminField label="Photo path or URL" name="photo" defaultValue={editingHotel?.photos?.[0] || '/images/hero-hotel.jpg'}/><AdminField label="Amenities (comma separated)" name="amenities" defaultValue={editingHotel?.amenities?.join(', ') || ''}/></div><label className="field"><span>Description</span><textarea name="description" required rows="3" defaultValue={editingHotel?.description || ''}/></label><div className="form-actions"><button className="button button-dark" disabled={busy}>{busy ? 'Saving…' : editingHotel ? 'Save hotel' : 'Add hotel'} <Check size={16}/></button>{editingHotel && <button type="button" className="button button-light" onClick={() => { setEditingHotel(null); setTab('hotels'); }}>Discard changes</button>}</div></form>}
  </main>;
}

function Stat({ icon, label, value, detail }) { return <article className="admin-stat"><span className="stat-icon">{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function AdminField({ label, ...props }) { return <label className="field"><span>{label}</span><input {...props}/></label>; }
