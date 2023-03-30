import {formatPokemonId} from '@/utils/pokemon';

function PokemonCardLoader() {
	return (
		<div className={'pokemon-card bg-slate-400 h-32 animate-pulse'}>
			<div className='flex items-center justify-between w-full pl-5 pr-1'>
				<div className='w-full'>
					<div>#{formatPokemonId('1')}</div>
					<b className='col-span-3 text-2xl text-white capitalize'>{'name'}</b>
					<div className='flex space-x-2 text-sm text-white'></div>
				</div>
			</div>
		</div>
	);
}

export default PokemonCardLoader;
