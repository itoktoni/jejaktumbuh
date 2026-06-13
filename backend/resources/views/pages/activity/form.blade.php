<?php /** @var App\Models\Activity $model */ ?>

<x-layouts::app>
    <x-breadcrumb :items="[['url' => moduleRoute('getTable'), 'label' => ucfirst(module())], ['url' => '', 'label' => isset($model) && $model->exists ? 'Update' : 'Create']]" />

    <x-form :model="$model">
        <x-card :label="ucfirst(module())">
            @bind($model ?? null)
                <x-input col="4" name="title" />
                <x-input col="4" name="type" />
                <x-input col="4" name="slug" />
                <x-textarea col="12" name="desc" />
                <x-input col="4" name="image" />
                <x-input col="4" name="moral" />
                <x-input col="4" name="sort_order" />
                <x-toggle col="4" name="active" />
            @endbind
        </x-card>

        <x-action :model="$model" :action="['save']"/>
    </x-form>
</x-layouts::app>
