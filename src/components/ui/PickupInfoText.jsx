export default function PickupInfoText({ profile }) {
  const cityLine = profile.city ? (
    <>
      Retira en <span className="font-bold text-ink">{profile.city}</span>
      {profile.pickup_point?.name && (
        <>
          {" "}— <span className="font-bold text-ink">{profile.pickup_point.name}</span>
        </>
      )}
      <br />
    </>
  ) : null;

  if (profile.has_stand) {
    return (
      <>
        {cityLine}
        {profile.stand_number ? (
          <>Tiene stand fijo: <span className="font-bold text-ink">{profile.stand_number}</span></>
        ) : (
          <>Tiene stand fijo en el evento.</>
        )}
      </>
    );
  }
  if (profile.pickup_day || profile.pickup_time || profile.contact_phone) {
    return (
      <>
        {cityLine}
        Prefiere coordinar el retiro
        {profile.pickup_day && (
          <>
            {" "}— <span className="font-bold text-ink">{profile.pickup_day}</span>
          </>
        )}
        {profile.pickup_time && (
          <>
            {" "}a las <span className="font-bold text-ink">{profile.pickup_time}</span>
          </>
        )}
        {profile.contact_phone && (
          <>
            <br />
            Contacto: <span className="font-bold text-ink">{profile.contact_phone}</span>
          </>
        )}
      </>
    );
  }
  if (cityLine) return cityLine;
  return "Todavía no cargó cómo prefiere coordinar el retiro.";
}
