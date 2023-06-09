import BadgeType from '@/components/badge-type';
import Iconify from '@/components/iconify';
import {fetchPokemon, useQueryPokemon} from '@/queries/Pokemon';
import {fetchPokemonTypeRelation, useQueryPokemonTypeRelation} from '@/queries/pokemon-types';
import About from '@/sections/detail/pokemon-about';
import Data from '@/sections/detail/pokemon-data';
import Move from '@/sections/detail/pokemon-move';
import Stat from '@/sections/detail/pokemon-stat';
import Training from '@/sections/detail/pokemon-training';
import getQueryClient from '@/utils/getQueryClient';
import {formatPokemonId} from '@/utils/pokemon';
import {
	type GetStaticPathsResult,
	type GetStaticPropsContext,
	type GetStaticPropsResult,
} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import Masonry from 'react-masonry-css';
import {dehydrate, type DehydratedState} from 'react-query';

type Context = GetStaticPropsContext<{name: string}>;
type Result = GetStaticPropsResult<{
	dehydratedState: DehydratedState;
}>;

export async function getStaticProps({params}: Context): Promise<Result> {
	const {name} = params!;
	try {
		const queryClient = getQueryClient();
		await queryClient.fetchQuery(['pokemon', name], fetchPokemon);
		await queryClient.fetchQuery(['pokemon-type-relation', name], fetchPokemonTypeRelation);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const dehydratedState = JSON.parse(JSON.stringify(dehydrate(queryClient)));
		return {
			props: {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				dehydratedState,
			},
		};
	} catch {
		return {
			notFound: true,
		};
	}
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
	return {
		paths: ['bulbasaur', 'charmander', 'squirtle', 'pikachu'].map(pokemonName => ({
			params: {name: pokemonName},
		})),
		fallback: 'blocking',
	};
}

export default function PokemonDetail() {
	const router = useRouter();
	const {name = ''} = router.query;
	const pokemonName = Array.isArray(name) ? name[0].toString() : name.toString();
	const {data} = useQueryPokemon(pokemonName);
	const {data: datatType} = useQueryPokemonTypeRelation(pokemonName);
	const typeRelation = datatType?.pokemon;
	const resistant = typeRelation?.resistant ?? [];
	const weaknesses = typeRelation?.weaknesses ?? [];
	const pokemon = data!;
	const {
		id,
		weight,
		height,
		pokemon_v2_pokemonabilities: pokeAbilities,
		pokemon_v2_pokemonmoves: pokeMoves,
		pokemon_v2_pokemonspecy: pokeSpecy,
		pokemon_v2_pokemonstats: pokeStats,
	} = pokemon;
	const types = pokemon.pokemon_v2_pokemontypes.map(item => item.pokemon_v2_type.name);
	const imageUrl =
		'https://cdn.statically.io/gh/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
	useEffect(() => {
		document.body.classList.add(`bg-elm-${types[0]}`);
		// Clean up the effect when the component unmounts
		return () => {
			document.body.classList.remove(`bg-elm-${types[0]}`);
		};
	}, [types]);

	return (
		<div className={`bg-elm-${types[0]} h-full`}>
			<Link href={'/'}>
				<Iconify className='p-5 text-5xl text-white ' icon='akar-icons:arrow-left' />
			</Link>
			<div className='flex items-center justify-center gap-5'>
				<Image
					src={`${imageUrl}/${id}.png`}
					alt={pokemonName}
					width={144}
					height={144}
					priority
					className='relative right-0 drop-shadow-lg'
				/>
				<div className='space-y-2'>
					<div>#{formatPokemonId(id)}</div>
					<b className='col-span-3 text-2xl text-white capitalize'>{name}</b>
					<div className='flex space-x-2 text-sm text-white'>
						{types.map(type => (
							<BadgeType key={type} type={type} />
						))}
					</div>
				</div>
			</div>
			<Masonry
				// eslint-disable-next-line @typescript-eslint/naming-convention
				breakpointCols={{default: 2, 768: 1}}
				className={'pokemon-detail-card-container'}
			>
				<About
					pokemon_v2_pokemonspeciesflavortexts={pokeSpecy.pokemon_v2_pokemonspeciesflavortexts}
					type={types[0]}
				/>
				<Data
					weight={weight}
					height={height}
					pokemon_v2_pokemonabilities={pokeAbilities}
					pokemon_v2_pokemonspecy={pokeSpecy}
					type={types[0]}
					weaknesses={weaknesses}
					resistant={resistant}
				/>
				<Stat pokemon_v2_pokemonstats={pokeStats} type={types[0]} />

				<Move pokemon_v2_pokemonmoves={pokeMoves} type={types[0]} />
				<Training
					type={types[0]}
					happiness={pokeSpecy.base_happiness}
					growthRate={pokeSpecy.pokemon_v2_growthrate.name}
					captureRate={pokeSpecy.capture_rate}
					hatchCounter={pokeSpecy.hatch_counter}
				/>
			</Masonry>
		</div>
	);
}
