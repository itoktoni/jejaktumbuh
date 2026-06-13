<?php

namespace App\Models;

use App\Models\BaseModel;

class Schedule extends BaseModel
{
    protected $table = 'schedules';
    protected $keyType = 'int';
    protected $primaryKey = 'schedule_id';

    public $timestamps = false;
    public $incrementing = true;

    public static $filterColumns = [
        'schedule_id' => 'Id',
        'schedule_id_anak' => 'Anak',
        'schedule_label' => 'Label',
        'schedule_time' => 'Time',
        'schedule_done' => 'Done',
        'schedule_date' => 'Date',
        'schedule_created_at' => 'Created At',
    ];

    public static $sortColumns = [
        'schedule_id',
        'schedule_id_anak',
        'schedule_label',
        'schedule_time',
        'schedule_done',
        'schedule_date',
        'schedule_created_at',
    ];

    protected $fillable = [
        'schedule_id_anak',
        'schedule_label',
        'schedule_time',
        'schedule_done',
        'schedule_date',
    ];

    protected $casts = [
        'schedule_done' => 'boolean',
        'schedule_date' => 'date',
    ];

    public function rules(): array
    {
        return [
            'schedule_id_anak' => 'required',
            'schedule_label' => 'required|string|max:255',
        ];
    }

    public static function field_name()
    {
        return 'schedule_label';
    }

    public function has_anak()
    {
        return $this->belongsTo(Anak::class, 'schedule_id_anak', 'anak_id');
    }
}
