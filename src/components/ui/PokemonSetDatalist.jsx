import { POKEMON_SET_ERAS } from "../../lib/pokemonSets";

// Sugerencias de sets reales para el campo "Colección / set" — sigue
// siendo texto libre, esto solo autocompleta los nombres más comunes.
export default function PokemonSetDatalist() {
  return (
    <datalist id="pokemon-set-options">
      {POKEMON_SET_ERAS.flatMap((era) => era.sets).map((set) => (
        <option key={set} value={set} />
      ))}
    </datalist>
  );
}
