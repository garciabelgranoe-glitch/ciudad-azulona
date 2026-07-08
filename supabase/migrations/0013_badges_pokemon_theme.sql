-- Las medallas genéricas (🥉🥈🥇💎⭐) se reemplazan por conceptos propios
-- del universo Pokémon (Poké Ball, Great Ball, Ultra Ball, Master Ball y
-- Cinta de Confianza — las cintas son un mecanismo real de logros en los
-- juegos, no un personaje). El ícono ahora es una clave que el frontend
-- dibuja como SVG propio, no un emoji ni un logo de terceros.

update public.badges set icon = 'pokeball_red', name = 'Poké Ball', description = 'Vendiste tu primera carta' where code = 'ventas_bronce';
update public.badges set icon = 'pokeball_blue', name = 'Great Ball', description = 'Vendiste 5 cartas' where code = 'ventas_plata';
update public.badges set icon = 'pokeball_black', name = 'Ultra Ball', description = 'Vendiste 15 cartas' where code = 'ventas_oro';
update public.badges set icon = 'pokeball_purple', name = 'Master Ball', description = 'Vendiste 30 cartas' where code = 'ventas_platino';
update public.badges set icon = 'ribbon_gold', name = 'Cinta de Confianza', description = 'Reputación de 4.8 o más con al menos 5 calificaciones' where code = 'reputacion_alta';
