<?php

namespace App\Http\Controllers;

use App\Concerns\AnakUserTrait;
use App\Concerns\NormalizeInputTrait;
use App\Models\Schedule;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    use AnakUserTrait, NormalizeInputTrait;

    public function store(Request $request, $anakId)
    {
        if (! $this->authorizeAnak($request, (int) $anakId)) {
            return $this->unauthorized();
        }

        $data = $this->normalizeScheduleInput($request->all());

        $rules = [
            'schedule_label' => 'required|string|max:255',
            'schedule_time' => 'nullable|string|max:20',
            'schedule_done' => 'nullable|boolean',
            'schedule_date' => 'nullable|string|max:50',
        ];
        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'code' => 422, 'message' => 'The given data was invalid.', 'data' => $validator->errors()], 422);
        }
        $data = $validator->validated();

        $schedule = Schedule::create([
            'schedule_id_anak' => $anakId,
            ...$data,
        ]);

        return response()->json($schedule, 201);
    }

    public function update(Request $request, $anakId, $scheduleId)
    {
        if (! $this->authorizeAnak($request, (int) $anakId)) {
            return $this->unauthorized();
        }

        $data = $this->normalizeScheduleInput($request->all());

        $rules = [
            'schedule_label' => 'nullable|string|max:255',
            'schedule_time' => 'nullable|string|max:20',
            'schedule_done' => 'nullable|boolean',
        ];
        $validator = \Illuminate\Support\Facades\Validator::make($data, $rules);
        if ($validator->fails()) {
            return response()->json(['status' => false, 'code' => 422, 'message' => 'The given data was invalid.', 'data' => $validator->errors()], 422);
        }
        $data = $validator->validated();

        $schedule = Schedule::where('schedule_id', $scheduleId)->where('schedule_id_anak', $anakId)->firstOrFail();
        $schedule->update($data);

        return response()->json($schedule);
    }

    public function destroy(Request $request, $anakId, $scheduleId)
    {
        if (! $this->authorizeAnak($request, (int) $anakId)) {
            return $this->unauthorized();
        }

        Schedule::where('schedule_id', $scheduleId)->where('schedule_id_anak', $anakId)->delete();

        return response()->json(null, 204);
    }
}
