import { useState } from "react";
import { ChevronDown } from "lucide-react";
import GenderIcon from "../GenderIcon";

export default function AccountMenu({
  alias,
  gender,
  isAdmin,
  onOpenProfile,
  onOpenMyBids,
  onOpenMyPublications,
  onOpenMyTickets,
  onOpenFavorites,
  onOpenRecommended,
  onOpenTopMonthly,
  onOpenBlog,
  onOpenGiveaways,
  onOpenCommunities,
  onOpenRanking,
  onOpenSuggestions,
  onOpenFaq,
  onOpenAdmin,
  onOpenPro,
}) {
  const [open, setOpen] = useState(false);

  function MenuGroup({ label, children }) {
    return (
      <div className="border-t border-line first:border-t-0">
        <p className="px-4 pt-2.5 text-[9px] font-bold uppercase tracking-wide text-ink-soft/70">{label}</p>
        {children}
      </div>
    );
  }

  function MenuItem({ onClick, danger, children }) {
    return (
      <button
        onClick={() => {
          setOpen(false);
          onClick();
        }}
        className={`block w-full px-4 py-2 text-left text-[12px] font-bold hover:bg-cream ${danger ? "text-[#B9432C]" : ""}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-bold text-cream/80 transition hover:bg-white/10 hover:text-paper md:border md:border-white/20"
      >
        <GenderIcon gender={gender} size={14} />
        <span className="max-w-[110px] truncate">{alias}</span>
        <ChevronDown size={12} className={`shrink-0 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-[80vh] w-56 overflow-y-auto rounded-lg border-2 border-ink bg-paper text-ink shadow-card">
            <MenuGroup label="Mi cuenta">
              <MenuItem onClick={onOpenProfile}>Mi perfil</MenuItem>
              <MenuItem onClick={onOpenMyBids}>Mis pujas</MenuItem>
              <MenuItem onClick={onOpenMyPublications}>Mis publicaciones</MenuItem>
              <MenuItem onClick={onOpenMyTickets}>Mis tickets</MenuItem>
              <MenuItem onClick={onOpenFavorites}>Mis favoritos</MenuItem>
              <MenuItem onClick={onOpenPro}>Hazte Pro ✨</MenuItem>
            </MenuGroup>
            <MenuGroup label="Comunidad">
              <MenuItem onClick={onOpenRecommended}>Vendedores garantizados</MenuItem>
              <MenuItem onClick={onOpenTopMonthly}>Destacadas del mes</MenuItem>
              <MenuItem onClick={onOpenBlog}>Novedades</MenuItem>
              <MenuItem onClick={onOpenGiveaways}>Sorteos</MenuItem>
              <MenuItem onClick={onOpenCommunities}>Comunidades de WhatsApp</MenuItem>
              <MenuItem onClick={onOpenRanking}>Ranking</MenuItem>
            </MenuGroup>
            <MenuGroup label="Ayuda">
              <MenuItem onClick={onOpenSuggestions}>Sugerencias</MenuItem>
              <MenuItem onClick={onOpenFaq}>Preguntas frecuentes</MenuItem>
            </MenuGroup>
            {isAdmin && (
              <MenuGroup label="Admin">
                <MenuItem onClick={onOpenAdmin} danger>Panel admin</MenuItem>
              </MenuGroup>
            )}
          </div>
        </>
      )}
    </div>
  );
}
